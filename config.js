'use strict';

const ENV = process.env;


module.exports = {
    trello: {
        key: ENV.TRELLO_KEY,
        token: ENV.TRELLO_TOKEN,
    },

    boards: {
        source: ENV.BOARDS_SOURCE,
        destination: ENV.BOARDS_DESTINATION,
    }
};
