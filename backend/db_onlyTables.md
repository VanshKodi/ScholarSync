--
-- Name: chat_message_citations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message_citations (
    citation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    chunk_id uuid NOT NULL,
    score double precision,
    snippet text NOT NULL,
    start_char integer,
    end_char integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    message_index integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    embedding_model text,
    embedding public.vector(384),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])))
);


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    chat_id uuid DEFAULT gen_random_uuid() NOT NULL,
    university_id uuid NOT NULL,
    created_by uuid NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_tool_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_tool_runs (
    tool_run_id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    message_id uuid NOT NULL,
    tool_name text NOT NULL,
    status text DEFAULT 'success'::text NOT NULL,
    input_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    code text,
    output_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    error_text text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    CONSTRAINT chat_tool_runs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text])))
);


--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_chunks (
    chunk_id uuid DEFAULT gen_random_uuid() NOT NULL,
    doc_id uuid NOT NULL,
    chunk_index integer NOT NULL,
    text_content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    chunk_type text DEFAULT 'text'::text NOT NULL,
    chunk_meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT document_chunks_chunk_type_check CHECK ((chunk_type = ANY (ARRAY['text'::text, 'pdf'::text, 'csv'::text, 'excel'::text])))
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
-- Name: chat_message_citations chat_message_citations_message_id_chunk_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_citations
    ADD CONSTRAINT chat_message_citations_message_id_chunk_id_key UNIQUE (message_id, chunk_id);


--
-- Name: chat_message_citations chat_message_citations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_citations
    ADD CONSTRAINT chat_message_citations_pkey PRIMARY KEY (citation_id);


--
-- Name: chat_messages chat_messages_chat_id_message_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_chat_id_message_index_key UNIQUE (chat_id, message_index);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (message_id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (chat_id);


--
-- Name: chat_tool_runs chat_tool_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_tool_runs
    ADD CONSTRAINT chat_tool_runs_pkey PRIMARY KEY (tool_run_id);


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
-- Name: idx_chat_message_citations_chunk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_message_citations_chunk_id ON public.chat_message_citations USING btree (chunk_id);


--
-- Name: idx_chat_message_citations_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_message_citations_message_id ON public.chat_message_citations USING btree (message_id);


--
-- Name: idx_chat_messages_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id);


--
-- Name: idx_chat_messages_chat_id_message_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_chat_id_message_index ON public.chat_messages USING btree (chat_id, message_index);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_messages_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_embedding ON public.chat_messages USING ivfflat (embedding) WITH (lists='50');


--
-- Name: idx_chat_messages_embedding_model; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_embedding_model ON public.chat_messages USING btree (embedding_model);


--
-- Name: idx_chat_messages_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_fts ON public.chat_messages USING gin (to_tsvector('english'::regconfig, content));


--
-- Name: idx_chat_messages_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_role ON public.chat_messages USING btree (role);


--
-- Name: idx_chat_sessions_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_created_by ON public.chat_sessions USING btree (created_by);


--
-- Name: idx_chat_sessions_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_university ON public.chat_sessions USING btree (university_id);


--
-- Name: idx_chat_tool_runs_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_tool_runs_chat_id ON public.chat_tool_runs USING btree (chat_id);


--
-- Name: idx_chat_tool_runs_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_tool_runs_message_id ON public.chat_tool_runs USING btree (message_id);


--
-- Name: idx_chat_tool_runs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_tool_runs_status ON public.chat_tool_runs USING btree (status);


--
-- Name: idx_chat_tool_runs_tool_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_tool_runs_tool_name ON public.chat_tool_runs USING btree (tool_name);


--
-- Name: idx_document_chunks_chunk_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_chunks_chunk_type ON public.document_chunks USING btree (chunk_type);


--
-- Name: idx_document_chunks_doc_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_chunks_doc_id ON public.document_chunks USING btree (doc_id);


--
-- Name: idx_document_chunks_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_chunks_fts ON public.document_chunks USING gin (to_tsvector('english'::regconfig, text_content));


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
-- Name: idx_embeddings_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_embeddings_vector ON public.embeddings USING ivfflat (vector) WITH (lists='100');


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
-- Name: chat_message_citations chat_message_citations_chunk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_citations
    ADD CONSTRAINT chat_message_citations_chunk_id_fkey FOREIGN KEY (chunk_id) REFERENCES public.document_chunks(chunk_id) ON DELETE CASCADE;


--
-- Name: chat_message_citations chat_message_citations_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_citations
    ADD CONSTRAINT chat_message_citations_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(message_id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat_sessions(chat_id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE;


--
-- Name: chat_tool_runs chat_tool_runs_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_tool_runs
    ADD CONSTRAINT chat_tool_runs_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat_sessions(chat_id) ON DELETE CASCADE;


--
-- Name: chat_tool_runs chat_tool_runs_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_tool_runs
    ADD CONSTRAINT chat_tool_runs_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(message_id) ON DELETE CASCADE;


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

