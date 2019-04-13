
module.exports = {
<<<<<<< HEAD
	up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER
		},
		username: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING,
			unique: true
		},
		provider: {
			type: Sequelize.STRING,
			defaultValue: 'local',
		},
		bio: {
			type: Sequelize.TEXT
		},
		image: {
			type: Sequelize.STRING
		},
		following: {
			type: Sequelize.BOOLEAN
		},
		password: {
			type: Sequelize.STRING
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE
		}
	}),
	down: (queryInterface, Sequelize) => queryInterface.dropTable('Users')
=======
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    bio: {
      type: Sequelize.TEXT
    },
    image: {
      type: Sequelize.STRING
    },
    following: {
      type: Sequelize.BOOLEAN
    },
    password: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Users')
>>>>>>> 165020126 implement the fetch average rating of an article endpoint
};
