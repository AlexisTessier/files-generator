'use strict';

module.exports = () => (new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50)));;