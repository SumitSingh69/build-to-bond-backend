import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dailyMatches: [
      {
        matchedUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        compatibilityScore: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        matchReasons: [
          {
            category: {
              type: String,
              enum: [
                "interests",
                "location",
                "age",
                "lifestyle",
                "goals",
                "education",
              ],
            },
            description: String,
            weight: Number,
          },
        ],
        status: {
          type: String,
          enum: [
            "pending",
            "liked",
            "passed",
            "super_liked",
            "matched",
            "expired",
          ],
          default: "pending",
        },
        generatedAt: {
          type: Date,
          default: Date.now,
        },
        actionTakenAt: Date,
        expiresAt: {
          type: Date,
          default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    ],

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
    },

    userBehavior: {
      averageTimeToDecide: Number,
      likeRatio: { type: Number, default: 0 },
      preferredTimeOfDay: [Number],
      peakActivityDays: [Number],
    },

    lastGenerated: {
      type: Date,
      default: Date.now,
    },

    stats: {
      totalMatches: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalPasses: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ userId: 1 });
matchSchema.index({ userId: 1, "dailyMatches.matchedUserId": 1 });
matchSchema.index({ "dailyMatches.generatedAt": 1 });
matchSchema.index({ "dailyMatches.expiresAt": 1 });

matchSchema.methods.getActiveMatches = function () {
  return this.dailyMatches.filter(
    (match) => match.status === "pending" && match.expiresAt > new Date()
  );
};

matchSchema.methods.updateBehaviorStats = function (action, timeTaken) {
  if (action === "like") this.stats.totalLikes++;
  if (action === "pass") this.stats.totalPasses++;
  if (action === "super_like") this.stats.totalSuperLikes++;

  const totalDecisions =
    this.stats.totalLikes + this.stats.totalPasses + this.stats.totalSuperLikes;
  this.userBehavior.averageTimeToDecide =
    ((this.userBehavior.averageTimeToDecide || 0) * (totalDecisions - 1) +
      timeTaken) /
    totalDecisions;

  this.userBehavior.likeRatio = this.stats.totalLikes / totalDecisions;
};

export default mongoose.model("Match", matchSchema);
