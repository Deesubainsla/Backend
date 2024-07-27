import mongoose, {Schema} from "mongoose";
/*
The all models which we design for DB are a kind of collections which saves the information
in form of document for each entity.

In this model there is two things only subscriber and channel to account the subscriber and subscribed
which we have also used in getUserChannelProfile in controllers.
*/
const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        //saves the id of the reference(ref):
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);