import mongoose,{model, Schema} from "mongoose";

mongoose.connect("mongodb+srv://Amitz5:amitoz475@cluster1.heirvrx.mongodb.net/");

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

