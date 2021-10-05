import { Connection } from 'typeorm';

export const superAdmin = {
  name: 'Super Admin',
  username: 'super-admin',
  password: '$2b$10$8nfQAClO146d6qtN/GeCWu9hC62XiIvXp.lbG.Y8WE4WoN57GDxMW',
  walletAddress: '0x00b108e445c6fb0e38ef3a7d4ba5b4f934471236',
  userRoleId: '1',
};

export const electionAuthority = {
  name: 'Election Authority',
  username: 'election-authority',
  password: '$2b$10$817eBIxNR8yKT2xq12mVtO6ZV3OULvwziM1sFpLGT2kj//XxHfq3.',
  walletAddress: '0x00d916c9f68084c4da0d8c69dc8882901f6cd6b7',
  userRoleId: '2',
};

export const voter = {
  id: 3,
  name: 'Voter',
  username: 'voter',
  password: '$2b$10$yr6HNf15aJY.eQHBPk0IZOmc.3kAPuNtPhjMR9MiWGLhW.EHI501W',
  walletAddress: '0x0007b3a2938f0441d7e92fb0a7a0c1d014c26fac',
  userRoleId: '3',
};

export const election = {
  name: 'Election',
  description: 'Some election',
  start: '2021-09-22',
  end: '2021-09-23',
  status: 2,
  ea: 2,
};

export const availableElection = {
  id: 1,
  name: 'availableElection',
  description: 'Available Election',
  start: '2021-09-22',
  end: '2021-09-23',
  status: 4,
  ea: 2,
};

export const followedElection = {
  id: 2,
  name: 'followedElection',
  description: 'Followed Election',
  start: '2021-09-22',
  end: '2021-09-23',
  status: 4,
  ea: 2,
};

export const endedElection = {
  id: 3,
  name: 'endedElection',
  description: 'Ended Election',
  start: '2021-09-22',
  end: '2021-09-23',
  status: 5,
  ea: 2,
};

export const candidate = {
  id: 1,
  name: 'Candidate',
  nameSlug: 'candidate',
  visi: 'visi',
  election: 'Election',
  misi: ['misi', 'misi'],
  pengalaman: ['pengalaman', 'pengalaman'],
};

export const clearDb = async (connection: Connection) => {
  await connection.query('delete from election_participant');
  await connection.query('alter table election_participant auto_increment = 1');
  await connection.query('DELETE from misi');
  await connection.query('ALTER TABLE misi AUTO_INCREMENT = 1');
  await connection.query('DELETE from pengalaman');
  await connection.query('ALTER TABLE pengalaman AUTO_INCREMENT = 1');
  await connection.query('DELETE from candidate');
  await connection.query('ALTER TABLE candidate AUTO_INCREMENT = 1');
  await connection.query('DELETE from election');
  await connection.query('ALTER TABLE election AUTO_INCREMENT = 1');
  await connection.query('DELETE from user');
  await connection.query('ALTER TABLE user AUTO_INCREMENT = 1');
};

export const populateUser = async (connection: Connection) => {
  await connection.query(`
    insert into user
    (name, username, password, walletAddress, userRoleId)
    values
    ('${superAdmin.name}', '${superAdmin.username}', '${superAdmin.password}', '${superAdmin.walletAddress}', '${superAdmin.userRoleId}')
  `);
  await connection.query(`
    insert into user
    (name, username, password, walletAddress, userRoleId)
    values
    ('${electionAuthority.name}', '${electionAuthority.username}', '${electionAuthority.password}', '${electionAuthority.walletAddress}', '${electionAuthority.userRoleId}')
  `);
  await connection.query(`
    insert into user
    (name, username, password, walletAddress, userRoleId)
    values
    ('${voter.name}', '${voter.username}', '${voter.password}', '${voter.walletAddress}', '${voter.userRoleId}')
  `);
};

export const populateElection = async (connection: Connection) => {
  await connection.query(`
    insert into election
    (name, description, start, end, electionAuthorityId, statusId)
    values
    ('${election.name}','${election.description}','${election.start}','${election.end}',${election.ea},${election.status});
  `);
};

export const populateCandidate = async (connection: Connection) => {
  await connection.query(`
    insert into candidate
    (name, visi, electionId, nameSlug)
    values
    ('${candidate.name}', '${candidate.visi}', ${followedElection.id}, '${candidate.nameSlug}')
  `);
  await connection.query(`
    insert into misi
    (misi, candidateId)
    values
    ('${candidate.misi[0]}', 1),
    ('${candidate.misi[1]}', 1)
  `);
  await connection.query(`
    insert into pengalaman
    (pengalaman, candidateId)
    values
    ('${candidate.pengalaman[0]}', 1),
    ('${candidate.pengalaman[1]}', 1)
  `);
};
