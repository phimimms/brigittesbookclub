/*
  eslint-disable
    @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-require-imports,
    @typescript-eslint/no-var-requires
*/
const sass = require('node-sass');

module.exports = {
  preprocess: {
    style({ content, attributes }) {
      if (![ 'text/scss' ].some(attributes.type) && ![ 'scss' ].some(attributes.lang)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        sass.render(
          {
            data: content,
            outFile: 'x',
            sourceMap: true,
          },
          (err, result) => {
            if (err) {
              return reject(err);
            }

            return resolve({
              code: result.css.toString(),
              map: result.map.toString(),
            });
          },
        );
      });
    },
  },
};
