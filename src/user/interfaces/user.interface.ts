export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: [string];
  refreshToken: string;
  expirationDate: Date;
}

// https://medium.com/@gausmann.simon/nestjs-typeorm-and-postgresql-full-example-development-and-project-setup-working-with-database-c1a2b1b11b8f

/*

CREATE TABLE users
(
  id serial NOT NULL,
  first_name character varying(255),
  middle_name character varying(255),
  last_name character varying(255),
  login character varying(255),
  password character varying(255),
  current_user_key character varying(64),
  uptime integer DEFAULT (date_part('epoch'::text, now()))::integer,
  data text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)


CREATE TABLE social_networks
(
  user_id integer NOT NULL,
  social_name character varying(25) NOT NULL,
  social_id character varying(50) NOT NULL,
  CONSTRAINT social_networks_pkey PRIMARY KEY (user_id, social_name),
  CONSTRAINT user_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH FULL
      ON UPDATE CASCADE ON DELETE CASCADE
)
*/
