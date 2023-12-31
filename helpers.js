//Generate a random string of 6 characters
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//takes in the email and outputs the id attached to the email
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

//Filters the urlDatabase for URLs that match the current User's ID
const urlsForUser = (id, database) => {
  const userUrls = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail};