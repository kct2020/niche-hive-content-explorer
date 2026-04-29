import { IndexedEntity } from "./core-utils";
import type { User } from "@shared/types";
import { MOCK_USERS } from "@shared/mock-data";
/**
 * Minimal User Entity to satisfy template architecture and core-utils requirements.
 * NHC data is currently fetched from Hypothesis API but could be indexed here in the future.
 */
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}