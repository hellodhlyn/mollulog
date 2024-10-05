create table if not exists passkeys (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  memo text not null,
  passkeyId text not null,
  passkeyRawId text not null,
  publicKey blob not null,
  publicKeyAlgorithm integer not null,
  rawRequest text not null,
  counter integer not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create index if not exists passkeys_userId on passkeys (userId);
create unique index if not exists passkeys_passkeyId on passkeys (passkeyId);
