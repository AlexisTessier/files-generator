'use strict';

module.exports = () => (callback => setTimeout(()=>callback(new Error('callback function error')), 50));