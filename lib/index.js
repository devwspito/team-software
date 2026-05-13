'use strict';

module.exports = {
  ...require('./install'),
  ...require('./update'),
  ...require('./status'),
  ...require('./uninstall'),
  ...require('./scope'),
};
