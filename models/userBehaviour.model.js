import mongoose from "mongoose";
const userBehaviourSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  averageTimeToDecide: { type: Number },
  likeRatio: { type: Number, default: 0 },
  preferredTimeOfDay: { type: [Number] },
  peakActivityDays: { type: [Number] },
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18,
      },
      max: {
        type: Number,
        default: 99,
        max: 99,
      },
    },
    requiredInterests: [String],
    dealBreakers: {
      smoking: [String],
      drinking: [String],
      children: [String],
    },
    preferredEducation: [String],
    preferredOccupation: [String],
    preferredGender: String,
  },
  chatInitiationRate: { type: Number, default: 0 },
  avgChatLength: {
    sum: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  feedbackScore: {
    type: Map,
    of: Number,
  },
  lastFeedbackAskedAt: { type: Date, default: Date.now },
  feedbackPending: {
    type: Boolean,
    default: false,
  },
  feedbackTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the people they need to give feedback on
    },
  ],
});

const UserBehaviour = mongoose.model("UserBehaviour", userBehaviourSchema);
export default UserBehaviour;
