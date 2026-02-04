--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_chunks (
    chunk_id uuid DEFAULT gen_random_uuid() NOT NULL,
    doc_id uuid NOT NULL,
    chunk_index integer NOT NULL,
    text_content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_groups (
    document_group_id uuid DEFAULT gen_random_uuid() NOT NULL,
    university_id uuid NOT NULL,
    title text NOT NULL,
    ai_title text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_scope; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_scope (
    document_group_id uuid NOT NULL,
    scope_type text NOT NULL,
    owner_university_id uuid NOT NULL,
    owner_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT document_scope_check CHECK ((((scope_type = 'university'::text) AND (owner_user_id IS NULL)) OR ((scope_type = 'user'::text) AND (owner_user_id IS NOT NULL)))),
    CONSTRAINT document_scope_scope_type_check CHECK ((scope_type = ANY (ARRAY['university'::text, 'user'::text])))
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    doc_id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_group_id uuid NOT NULL,
    university_id uuid NOT NULL,
    storage_bucket text NOT NULL,
    storage_path text NOT NULL,
    mime_type text NOT NULL,
    content_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT documents_status_check CHECK ((status = ANY (ARRAY['active'::text, 'superseded'::text, 'archived'::text])))
);


--
-- Name: embeddings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.embeddings (
    embedding_id uuid DEFAULT gen_random_uuid() NOT NULL,
    chunk_id uuid NOT NULL,
    model_name text NOT NULL,
    vector public.vector(384),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role text NOT NULL,
    university_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'faculty'::text, 'student'::text]))),
    CONSTRAINT profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'blocked'::text])))
);


--
-- Name: universities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.universities (
    university_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_chunks document_chunks_doc_id_chunk_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_doc_id_chunk_index_key UNIQUE (doc_id, chunk_index);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (chunk_id);


--
-- Name: document_groups document_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_groups
    ADD CONSTRAINT document_groups_pkey PRIMARY KEY (document_group_id);


--
-- Name: document_scope document_scope_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_scope
    ADD CONSTRAINT document_scope_pkey PRIMARY KEY (document_group_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (doc_id);


--
-- Name: embeddings embeddings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.embeddings
    ADD CONSTRAINT embeddings_pkey PRIMARY KEY (embedding_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: universities universities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_name_key UNIQUE (name);


--
-- Name: universities universities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_pkey PRIMARY KEY (university_id);


--
-- Name: idx_document_chunks_doc_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_chunks_doc_id ON public.document_chunks USING btree (doc_id);


--
-- Name: idx_document_groups_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_groups_created_by ON public.document_groups USING btree (created_by);


--
-- Name: idx_document_groups_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_groups_university ON public.document_groups USING btree (university_id);


--
-- Name: idx_document_scope_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_scope_type ON public.document_scope USING btree (scope_type);


--
-- Name: idx_document_scope_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_scope_university ON public.document_scope USING btree (owner_university_id);


--
-- Name: idx_document_scope_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_scope_user ON public.document_scope USING btree (owner_user_id);


--
-- Name: idx_documents_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_group ON public.documents USING btree (document_group_id);


--
-- Name: idx_documents_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_hash ON public.documents USING btree (content_hash);


--
-- Name: idx_documents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_status ON public.documents USING btree (status);


--
-- Name: idx_documents_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_university ON public.documents USING btree (university_id);


--
-- Name: idx_embeddings_chunk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_embeddings_chunk ON public.embeddings USING btree (chunk_id);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);


--
-- Name: idx_profiles_university_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_university_id ON public.profiles USING btree (university_id);


--
-- Name: document_chunks document_chunks_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.documents(doc_id) ON DELETE CASCADE;


--
-- Name: document_groups document_groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_groups
    ADD CONSTRAINT document_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: document_groups document_groups_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_groups
    ADD CONSTRAINT document_groups_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE;


--
-- Name: document_scope document_scope_document_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_scope
    ADD CONSTRAINT document_scope_document_group_id_fkey FOREIGN KEY (document_group_id) REFERENCES public.document_groups(document_group_id) ON DELETE CASCADE;


--
-- Name: document_scope document_scope_owner_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_scope
    ADD CONSTRAINT document_scope_owner_university_id_fkey FOREIGN KEY (owner_university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE;


--
-- Name: document_scope document_scope_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_scope
    ADD CONSTRAINT document_scope_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: documents documents_document_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_group_id_fkey FOREIGN KEY (document_group_id) REFERENCES public.document_groups(document_group_id) ON DELETE CASCADE;


--
-- Name: documents documents_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE;


--
-- Name: embeddings embeddings_chunk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.embeddings
    ADD CONSTRAINT embeddings_chunk_id_fkey FOREIGN KEY (chunk_id) REFERENCES public.document_chunks(chunk_id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE RESTRICT;


--
-- Name: document_chunks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

--
-- Name: document_chunks document_chunks_select_by_scope; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_chunks_select_by_scope ON public.document_chunks FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM ((public.documents d
     JOIN public.document_scope s ON ((s.document_group_id = d.document_group_id)))
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((d.doc_id = document_chunks.doc_id) AND (p.status = 'active'::text) AND (((s.scope_type = 'university'::text) AND (s.owner_university_id = p.university_id)) OR ((s.scope_type = 'user'::text) AND (s.owner_user_id = auth.uid())))))));


--
-- Name: document_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: document_groups document_groups_insert_same_university; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_groups_insert_same_university ON public.document_groups FOR INSERT TO authenticated WITH CHECK (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.status = 'active'::text) AND (p.university_id = document_groups.university_id))))));


--
-- Name: document_groups document_groups_select_by_scope; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_groups_select_by_scope ON public.document_groups FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.document_scope s
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((s.document_group_id = document_groups.document_group_id) AND (p.status = 'active'::text) AND (((s.scope_type = 'university'::text) AND (s.owner_university_id = p.university_id)) OR ((s.scope_type = 'user'::text) AND (s.owner_user_id = auth.uid())))))));


--
-- Name: document_groups document_groups_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_groups_update_own ON public.document_groups FOR UPDATE TO authenticated USING ((created_by = auth.uid())) WITH CHECK ((created_by = auth.uid()));


--
-- Name: document_scope; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_scope ENABLE ROW LEVEL SECURITY;

--
-- Name: document_scope document_scope_insert_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_scope_insert_rules ON public.document_scope FOR INSERT TO authenticated WITH CHECK (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.status = 'active'::text) AND (p.university_id = document_scope.owner_university_id)))) AND (((scope_type = 'university'::text) AND (owner_user_id IS NULL) AND (EXISTS ( SELECT 1
   FROM public.profiles p2
  WHERE ((p2.id = auth.uid()) AND (p2.role = 'admin'::text) AND (p2.status = 'active'::text) AND (p2.university_id = document_scope.owner_university_id))))) OR ((scope_type = 'user'::text) AND (owner_user_id = auth.uid())))));


--
-- Name: document_scope document_scope_select_by_scope; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_scope_select_by_scope ON public.document_scope FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.status = 'active'::text) AND (((document_scope.scope_type = 'university'::text) AND (document_scope.owner_university_id = p.university_id)) OR ((document_scope.scope_type = 'user'::text) AND (document_scope.owner_user_id = auth.uid())))))));


--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_insert_by_scope; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_insert_by_scope ON public.documents FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.document_scope s
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((s.document_group_id = documents.document_group_id) AND (p.status = 'active'::text) AND (p.university_id = documents.university_id) AND (((s.scope_type = 'user'::text) AND (s.owner_user_id = auth.uid())) OR ((s.scope_type = 'university'::text) AND (p.role = 'admin'::text)))))));


--
-- Name: documents documents_select_by_scope; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_select_by_scope ON public.documents FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.document_scope s
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((s.document_group_id = documents.document_group_id) AND (p.status = 'active'::text) AND (((s.scope_type = 'university'::text) AND (s.owner_university_id = p.university_id)) OR ((s.scope_type = 'user'::text) AND (s.owner_user_id = auth.uid())))))));


--
-- Name: embeddings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_admin_select_university; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_admin_select_university ON public.profiles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text) AND (p.university_id = profiles.university_id)))));


--
-- Name: profiles profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- PostgreSQL database dump complete
--


