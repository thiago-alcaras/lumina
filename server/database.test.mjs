import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const post = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
test("schema, privacy, personalization, duplicate guard and billing entitlement", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
 create role authenticated;create role anon;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;
 grant usage on schema public,auth,storage to authenticated,anon,service_role;
 grant all on all tables in schema storage to authenticated;
 alter default privileges in schema public grant all on tables to authenticated,anon,service_role;
 `);
    await db.exec(
      await readFile(
        new URL("../supabase/schema.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.query("insert into auth.users values ($1,$2),($3,$4)", [
      a,
      JSON.stringify({ name: "Ana" }),
      b,
      JSON.stringify({ name: "Maya" }),
    ]);
    const asUser = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec("set role authenticated");
    };
    await asUser(a);
    await t.test(
      "profile onboarding enforces unique handles and owner permissions",
      async () => {
        await asUser(a);
        await db.query("update profiles set handle='ana_style' where id=$1", [
          a,
        ]);
        await asUser(b);
        await assert.rejects(() =>
          db.query("update profiles set handle='ana_style' where id=$1", [b]),
        );
        assert.equal(
          (
            await db.query(
              "update profiles set name='changed' where id=$1 returning id",
              [a],
            )
          ).rows.length,
          0,
        );
        await assert.rejects(() =>
          db.query("update profiles set created_at=now() where id=$1", [b]),
        );
        await asUser(a);
      },
    );
    await db.query(
      "insert into wardrobe(owner_id,name,category,image_path,fingerprint) values($1,'Cardigã','Tricô',$2,$3)",
      [a, a + "/a.jpg", "1".repeat(64)],
    );
    await db.query(
      "insert into posts(id,owner_id,title,image,mood) values($1,$2,'Meu look','https://example.com/a.jpg','Cozy')",
      [post, a],
    );
    await t.test("a user cannot read or write another wardrobe", async () => {
      await asUser(b);
      assert.equal((await db.query("select * from wardrobe")).rows.length, 0);
      await assert.rejects(() =>
        db.query(
          "insert into wardrobe(owner_id,name,category,image_path,fingerprint) values($1,'X','Tricô',$2,$3)",
          [a, a + "/b.jpg", "2".repeat(64)],
        ),
      );
    });
    await t.test("calendar cannot point at another person’s post", async () => {
      await asUser(b);
      await assert.rejects(() =>
        db.query(
          "insert into calendar(owner_id,date,post_id,mood) values($1,current_date,$2,'Cozy')",
          [b, post],
        ),
      );
    });
    await t.test("unique fingerprint rejects a duplicate item", async () => {
      await asUser(a);
      await assert.rejects(() =>
        db.query(
          "insert into wardrobe(owner_id,name,category,image_path,fingerprint) values($1,'Again','Tricô',$2,$3)",
          [a, a + "/b.jpg", "1".repeat(64)],
        ),
      );
    });
    await t.test(
      "likes update counts and interest score; unlike reverses it",
      async () => {
        await asUser(b);
        await db.query("insert into likes values($1,$2)", [b, post]);
        assert.equal(
          (await db.query("select like_count from posts")).rows[0].like_count,
          1,
        );
        assert.equal(
          (await db.query("select score from interests")).rows[0].score,
          1,
        );
        await db.query("delete from likes where user_id=$1", [b]);
        assert.equal(
          (await db.query("select like_count from posts")).rows[0].like_count,
          0,
        );
      },
    );
    await t.test("following feed excludes accounts not followed", async () => {
      await asUser(b);
      assert.equal(
        (await db.query("select feed_page(0,true,'','') as feed")).rows[0].feed
          .length,
        0,
      );
      await db.query("insert into follows values($1,$2)", [b, a]);
      assert.equal(
        (await db.query("select feed_page(0,true,'','') as feed")).rows[0].feed
          .length,
        1,
      );
    });
    await t.test("blocking hides posts in both directions", async () => {
      await asUser(b);
      await db.query("insert into blocks values($1,$2)", [b, a]);
      assert.equal((await db.query("select * from posts")).rows.length, 0);
      await asUser(a);
      assert.equal(
        (await db.query("select * from profiles where id=$1", [b])).rows.length,
        0,
      );
    });
    await t.test(
      "clients cannot forge subscription or vision entitlement",
      async () => {
        await asUser(a);
        await assert.rejects(() =>
          db.query(
            "insert into subscriptions(user_id,customer_id,status) values($1,'fake','active')",
            [a],
          ),
        );
        await assert.rejects(() => db.query("select reserve_vision($1)", [a]));
      },
    );
    await t.test(
      "quota is capped and billing events are idempotent",
      async () => {
        await db.exec("reset role");
        for (let i = 0; i < 10; i++)
          assert.equal(
            (await db.query("select reserve_vision($1) as ok", [a])).rows[0].ok,
            true,
          );
        assert.equal(
          (await db.query("select reserve_vision($1) as ok", [a])).rows[0].ok,
          false,
        );
        await db.query(
          "select apply_billing_event('evt1',$1,'cus1','sub1','active')",
          [a],
        );
        await db.query(
          "select apply_billing_event('evt1',$1,'cus1','sub1','canceled')",
          [a],
        );
        assert.equal(
          (await db.query("select status from subscriptions")).rows[0].status,
          "active",
        );
        assert.equal(
          (await db.query("select reserve_vision($1) as ok", [a])).rows[0].ok,
          true,
        );
      },
    );
  } finally {
    await db.close();
  }
});
