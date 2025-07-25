// Test script to debug the feedback API
const testData = {
  type: 'bug',
  message: 'This is a test message that is longer than 10 characters to meet validation requirements',
  email: 'test@example.com'
};

console.log('Testing feedback API with data:', testData);

fetch('https://zkkeynest.space/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  return response.text();
})
.then(data => {
  console.log('Response body:', data);
  try {
    const parsed = JSON.parse(data);
    console.log('Parsed response:', parsed);
  } catch (e) {
    console.log('Could not parse as JSON');
  }
})
.catch(error => {
  console.error('Request failed:', error);
});