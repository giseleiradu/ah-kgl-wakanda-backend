
const users = {
  withoutUsername: {
    email: 'hadad@andela.com',
    password: 'Hadad12@'
  },
  withoutEmail: {
    username: 'dusmel',
    password: 'Hadad12@'
  },
  wrongEmailFormat: {
    username: 'dusmel',
    email: 'hadad2andela.com',
    password: 'Hadad12@'
  },
  wrongPasswordFormat: {
    username: 'dusmel',
    email: 'hadad3@andela.com',
    password: 'Hadadss'
  },
  correct: {
    username: 'dusmel',
    email: 'hadad_test@andela.com',
    password: 'Hadad12@'
  },
  wrongLogInfo: {
    email: 'hadad_test@andela.com',
    password: 'Hadad12'
  },
  correctLogInfo: {
    email: 'hadad_test@andela.com',
    password: 'Hadad12@'
  },

};

export default users;