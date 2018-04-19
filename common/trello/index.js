'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    request = require('request'),
    winston = require('winston');


const API_URL = 'https://api.trello.com/1';


class Trello {
    constructor(config) {
        this._config = config;
    }


    getMyBoards() {
        winston.debug('[Trello] getMyBoards()');

        return this._makeRequest({
            url: 'members/me/boards',
        })
            .then((res) => res.body)
        ;
    }


    findBoardByName(name) {
        winston.debug('[Trello] findBoardByName(): name=', name);

        return this.getMyBoards()
            .then((boards) => _(boards)
                .filter((board) => board.name === name)
                .first()
            )
        ;
    }


    getAllListsFromBoard(boardId) {
        winston.debug('[Trello] getAllListsFromBoard(): boardId=', boardId);

        return this._makeRequest({
            url: `boards/${boardId}/lists`,
        })
            .then((res) => res.body)
        ;
    }


    search(query, boardId) {
        winston.debug('[Trello] search(): query=', query, ' / boardId=', boardId);

        return this._makeRequest({
            url: 'search',
            qs: {
                query,
                idBoards: boardId,
            },
        })
            .then((res) => res.body)
        ;
    }


    searchRefCard(url, boardId) {
        winston.debug('[Trello] searchRefCard(): url=', url, ' / boardId=', boardId);

        return this.search(url, boardId)
            .then((data) => data.cards)
        ;
    }


    getAllCardsFromBoard(boardId) {
        winston.debug('[Trello] getAllCardsFromBoard(): boardId=', boardId);

        return this._makeRequest({
            url: `boards/${boardId}/cards`,
        })
            .then((res) => res.body);
    }


    _makeRequest(opts) {
        return new Promise((resolve, reject) => {
            const realOpts = _.merge({
                baseUrl: API_URL,
                url: 'boards',
                qs: {
                    key: this._config.key,
                    token: this._config.token,
                },
                json: opts.json || true,
            }, opts);

            request(realOpts, (err, res) => {
                if (err) {
                    return reject(err);
                }

                if (res.statusCode === 401) {
                    return reject(res.body);
                }

                return resolve(res);
            });
        });
    }
}


////////////

module.exports = Trello;