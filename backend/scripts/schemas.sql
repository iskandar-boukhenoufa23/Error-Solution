-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat (
  id text NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT now(),
  title character varying,
  user_id text,
  CONSTRAINT chat_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id text,
  role character varying,
  message text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  full_name character varying,
  email character varying UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);