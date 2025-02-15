import mongoose,{Schema,model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile:{
            type: String,
            required: true
        },
        thumbnail:{
            type: String,
            required: true
        },
        tittle:{
            type: String,
            required: true
        },
        discription:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        ispublished:{
            type: Bool,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },{ timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model('Video', videoSchema);