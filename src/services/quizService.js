import api from './api';

function buildPayload(answers, city = 'caraguatatuba') {
  return {
    city,
    hairType:        answers[2]?.value  ?? '',
    beachFrequency:  answers[3]?.value  ?? '',
    sunProtection:   answers[5]?.value  ?? '',
    wetHair:         answers[4]?.value  ?? '',
    hairState:       answers[6]?.value  ?? '',
    chemicalProcess: answers[7]?.value  ?? '',
    season:          answers[9]?.season ?? answers[9]?.value ?? 'verao',
  };
}

export async function submitQuiz(answers, city = 'caraguatatuba') {
  const payload = buildPayload(answers, city);
  const { data } = await api.post('/quiz', payload);
  return data;
}

export async function getMyQuizResult() {
  try {
    const { data } = await api.get('/quiz/me');
    return data;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}