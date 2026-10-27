const { randomBytes } = require('node:crypto');
const { neon } = require('@neondatabase/serverless');
const cookieName='bilan_voter';
const postPattern=/^[A-Z]{3}\d{2}-\d{2}-[A-Z0-9]{1,4}$/;
function voter(req,res){
 const match=(req.headers.cookie||'').match(/(?:^|;\s*)bilan_voter=([a-f0-9]{48})(?:;|$)/);
 if(match)return match[1];
 const id=randomBytes(24).toString('hex');
 res.setHeader('Set-Cookie',`${cookieName}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
 return id;
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store, private, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({ok:false,error:'Method not allowed'});}
 if(!process.env.DATABASE_URL)return res.status(503).json({ok:false,error:'Voting database is not configured'});
 const sql=neon(process.env.DATABASE_URL);
 try{
  const id=voter(req,res);
  if(req.method==='GET'){
   const [totalsRows,mineRows]=await Promise.all([
    sql`SELECT post_id,COUNT(*) FILTER (WHERE choice=1)::int AS v1, COUNT(*) FILTER (WHERE choice=2)::int AS v2, COUNT(*)::int AS total FROM content_votes GROUP BY post_id`,
    sql`SELECT post_id,choice FROM content_votes WHERE voter_id=${id}`
   ]);
   const totals=Object.create(null),mine=Object.create(null);
   for(const row of totalsRows)totals[row.post_id]={v1:Number(row.v1),v2:Number(row.v2),total:Number(row.total)};
   for(const row of mineRows)mine[row.post_id]=Number(row.choice);
   return res.status(200).json({ok:true,totals,mine});
  }
  const origin=req.headers.origin;
  if(origin){let host;try{host=new URL(origin).host}catch{};const expected=req.headers['x-forwarded-host']||req.headers.host;if(host!==expected)return res.status(403).json({ok:false,error:'Request origin is not allowed'});}
  if(Number(req.headers['content-length']||0)>2048)return res.status(413).json({ok:false,error:'Request too large'});
  let body=req.body||{};if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({ok:false,error:'Invalid JSON'})}}
  const {postId,choice}=body;
  if(typeof postId!=='string'||!postPattern.test(postId)||!Number.isInteger(choice)||![1,2].includes(choice))return res.status(400).json({ok:false,error:'Invalid post or variation'});
  await sql`INSERT INTO content_votes (post_id,voter_id,choice) VALUES (${postId},${id},${choice}) ON CONFLICT(post_id,voter_id) DO UPDATE SET choice=EXCLUDED.choice,updated_at=now()`;
  const [row]=await sql`SELECT COUNT(*) FILTER (WHERE choice=1)::int AS v1,COUNT(*) FILTER (WHERE choice=2)::int AS v2,COUNT(*)::int AS total FROM content_votes WHERE post_id=${postId}`;
  return res.status(200).json({ok:true,postId,choice,totals:{v1:Number(row.v1),v2:Number(row.v2),total:Number(row.total)}});
 }catch(err){console.error('BILAN vote server error',err?.message||err);return res.status(503).json({ok:false,error:'Voting is temporarily unavailable'});}
};