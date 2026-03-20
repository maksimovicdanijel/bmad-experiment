import { closeDbConnection } from './helpers/db';

export default async function globalTeardown() {
  await closeDbConnection();
}
