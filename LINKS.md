# Сохранение модели

https://git2.altarix.org/marm/bundles/data_bundle/-/blob/master/Service/DataProviders/MongoProvider.php
https://git2.altarix.org/marm/bundles/data_bundle/-/blob/master/Controller/DataController.php

# MARM Deploy

https://confluence.altarix.ru/confluence/display/MARM/Environment
https://confluence.altarix.ru/confluence/pages/viewpage.action?pageId=78855278

# File Service

## file/put

https://confluence.altarix.ru/confluence/pages/viewpage.action?pageId=91261282

# Sync Service

# Printform Service

# Core API

http://dev.api-doc.blackhole.marm.altarix.org/

https://confluence.altarix.ru/confluence/pages/viewpage.action?pageId=88418157

# Other Links

## Sending HTTP requests, understanding multipart/form-data

https://wanago.io/2019/03/18/node-js-typescript-6-sending-http-requests-understanding-multipart-form-data/

## Image Processing

https://github.com/lovell/sharp
https://github.com/oliver-moran/jimp

// https://medium.com/@gausmann.simon/nestjs-typeorm-and-postgresql-full-example-development-and-project-setup-working-with-database-c1a2b1b11b8f

/\*

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
\*/
