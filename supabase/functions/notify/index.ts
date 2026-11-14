// 데코브라이트 서버 알림: 손님·작업자가 남긴 기록(coll, id)을 확인해 사장님 휴대폰으로 알림을 보냄
// 필요한 비밀값: VAPID_PRIVATE (Edge Functions > Secrets). 공개 열쇠는 아래 PUB.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const PUB = "BEF8hPtZJupghdggfkBwvOrYG7xplRP7zvPNA3XEsxRkqLyNIcMp7dl8iiOZMl9sfEAIyMavmNdpAXwkh5r1GDw";
const SITE = "https://mkenc3-ctrl.github.io/decobright/";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { coll, id, n } = await req.json();
    if (!["okq", "asreq", "chk", "rvq", "photos"].includes(coll) || typeof id !== "string" || id.length > 80) return out({ err: "bad" }, 400);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY"))!);
    const { data: row } = await sb.from("records").select("data").eq("coll", coll).eq("id", id).maybeSingle();
    const d = row?.data;
    if (!d || d._del) return out({ err: "none" }, 404);
    const at = +(d.at || d.added || 0);
    if (Date.now() - at > 15 * 60 * 1000) return out({ err: "old" }, 409); // 15분 지난 기록은 다시 알리지 않음
    let title = "데코브라이트", body = "", url = "index.html";
    if (coll === "okq") { title += " · 손님 답"; body = (d.name || d.no || "손님") + " 님 " + (d.act === "ok" ? "「이 견적으로 진행」" : "「상담이 더 필요」") + (d.md ? " · 실측 희망 " + d.md : ""); url = "list.html"; }
    else if (coll === "asreq") { title += " · 🛠 하자 접수"; body = (d.name || "고객") + " 님 · " + ((d.kinds || []).join(", ") || d.say || ""); }
    else if (coll === "chk") { title += " · 점검표 도착"; body = (d.by || "작업자") + (d.tr ? " (" + d.tr + ")" : "") + (d.no && d.no.length ? " · 못 한 것 " + d.no.length + "개" : " · 모두 확인"); url = "order.html?id=" + encodeURIComponent(d.oid || ""); }
    else if (coll === "rvq") { title += " · ⭐ 새 후기"; body = "★".repeat(d.star || 0) + " " + String(d.text || "").slice(0, 40); url = "stats.html"; }
    else { title += " · 📸 새 사진" + (n > 1 ? " " + n + "장" : ""); body = String(d.by || "") + (d.memo ? " · " + String(d.memo).slice(0, 40) : ""); url = "photos.html"; }
    webpush.setVapidDetails(SITE, PUB, Deno.env.get("VAPID_PRIVATE")!);
    const { data: subs } = await sb.from("records").select("id,data").eq("coll", "pushsub");
    let sent = 0;
    for (const s of subs || []) {
      if (!s.data?.sub || s.data._del) continue;
      try { await webpush.sendNotification(s.data.sub, JSON.stringify({ title, body, url, tag: coll + "-" + id })); sent++; }
      catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) await sb.from("records").upsert({ coll: "pushsub", id: s.id, data: { _del: true } }, { onConflict: "coll,id" }); }
    }
    return out({ sent });
  } catch (_e) { return out({ err: "fail" }, 500); }
});
