import { strictTransportSecurity } from "helmet";
import User from "../models/user.model.js";
import UserBehaviour from "../models/userBehaviour.model.js";
import axios from "axios";

function mapSearchType(score) {
  if (score <= 2) return "introvert"; // very low scores → inward
  if (score <= 4) return "organized"; // structured, careful
  if (score <= 6) return "creative"; // middle ground → imagination
  if (score <= 8) return "extrovert"; // social, energetic
  return "adventurous"; // very high scores → risk-taking
}

export const callAIModelService = async (userId) => {
  try {
    //first collect all the data ai wants
    const behaviour = await UserBehaviour.findOne({ userId });
    const user = await User.findById(userId);
    const chatInitRate = behaviour.chatInitiationRate
      ? behaviour.chatInitiationRate
      : 0;
    const feedbackScore =
      behaviour.feedbackScore.count > 0
        ? behaviour.feedbackScore.sum / behaviour.feedbackScore.count
        : 1;
    const avgChatLength =
      behaviour.avgChatLength.count > 0
        ? behaviour.avgChatLength.sum / behaviour.avgChatLength.count
        : 0;
    const chatDuration = behaviour.chatDuration ? behaviour.chatDuration : 0;
    const searchType =
      behaviour.searchType.count > 0
        ? behaviour.searchType.sum / behaviour.searchType.count
        : 0;
    const mappedSearchType = mapSearchType(searchType);
    const personailityScore = user.personailityScore
      ? user.personailityScore
      : 1;

    const data = [
      chatInitRate,
      feedbackScore,
      avgChatLength,
      chatDuration,
      mappedSearchType,
      personailityScore,
    ];
    //call the api
    const response = await axios.post(
      "https://pearl576-thrizll-final.hf.space/gradio_api/call/predict",
      {
        data,
      }
    );
    return response.eventId;
  } catch (error) {
    throw error;
  }
};
export const getClusterService = async (eventId) => {
  try {
    const response = await axios.get(
      "https://pearl576-thrizll-final.hf.space/gradio_api/call/predict/eventId"
    );
    return response;
  } catch (error) {
    throw error;
  }
};
