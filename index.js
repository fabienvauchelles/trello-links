'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    winston = require('winston');

const
    Trello = require('./common/trello');

const
    config = require('./config');


winston.level = 'info';


const trello = new Trello(config.trello);

Promise.all([
    trello.findBoardByName(config.boards.source),
    trello.findBoardByName(config.boards.destination)
])
    .spread(
        (boardSource, boardDest) => Promise.all([
            trello.getAllListsFromBoard(boardSource.id),
            trello.getAllCardsFromBoard(boardSource.id),
        ])
            .spread((lists, cards) => {
                const m = new Map();
                lists.forEach((list) => {
                    m.set(list.id, list);
                });

                return Promise.mapSeries(cards,
                    (card) => trello
                        .searchRefCard(card.shortUrl, boardDest.id)
                        .then((resCards) => {
                            if (!resCards || resCards.length <= 0) {
                                const list = m.get(card.idList);

                                winston.info(card.shortUrl, `[${list.name}]`, card.name);
                            }
                        }),
                );
            })
    )
    .catch((err) => {
        winston.error('Error:', err);
    })
;
