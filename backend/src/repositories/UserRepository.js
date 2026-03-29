import { UserModel } from '../models/UserModel.js';

export class UserRepository {
  async create(payload) {
    return UserModel.create(payload);
  }

  async findByEmail(email) {
    return UserModel.findOne({ email }).lean();
  }

  async findById(id) {
    return UserModel.findById(id).lean();
  }
}
