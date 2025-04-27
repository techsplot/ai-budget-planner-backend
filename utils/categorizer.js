
import LearnedKeyword from "../models/LearnedKeyword.js";


export const autoCategorize = async ({ description, userId }) => {
  const keyword = description.toLowerCase();

  // 1. Check learned keywords from DB
  const learned = await LearnedKeyword.findOne({
    userId,
    keyword: { $regex: keyword, $options: 'i' }
  });

  if (learned) return learned.category;

  // 2. Default keyword logic
  if (keyword.includes('kfc') || keyword.includes('pizza') || keyword.includes('restaurant')) {
    return 'Food';
  }

  if (keyword.includes('uber') || keyword.includes('bolt') || keyword.includes('taxi')) {
    return 'Transport';
  }

  if (keyword.includes('airtime') || keyword.includes('recharge') || keyword.includes('mtn')) {
    return 'Mobile Recharge';
  }

  if (keyword.includes('jumia') || keyword.includes('konga') || keyword.includes('store')) {
    return 'Shopping';
  }

  return 'Uncategorized';
};
