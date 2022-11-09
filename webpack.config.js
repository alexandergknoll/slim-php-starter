const path = require('path')
const webpack = require('webpack')
const minJSON = require('jsonminify')

const plugins = {
  progress: require('webpackbar'),
  clean: require('clean-webpack-plugin'),
  extractCSS: require('mini-css-extract-plugin'),
  sync: require('browser-sync-webpack-plugin'),
  html: require('html-webpack-plugin'),
  copy: require('copy-webpack-plugin'),
  sri: require('webpack-subresource-integrity')
}

module.exports = (env = {}, argv) => {
  const isProduction = argv.mode === 'production'

  let config = {
    context: path.resolve(__dirname, 'src'),

    entry: {
      vendor: [
        './styles/vendor.scss',
        './scripts/vendor.js'
      ],
      app: [
        './styles/app.scss',
        './scripts/app.js'
      ]
    },

    output: {
      path: path.resolve(__dirname, 'public'),
      publicPath: 'http://localhost:8000',
      filename: 'scripts/[name].js',
      crossOriginLoading: 'anonymous'
    },

    module: {
      rules: [
        {
          test: /\.((s[ac]|c)ss)$/,
          use: [
            plugins.extractCSS.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: ! isProduction
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: ! isProduction,
                postcssOptions: {
                  ident: 'postcss',
                  plugins: (() => {
                    return isProduction ? [
                      require('autoprefixer')(),
                      require('cssnano')({
                        preset: ['default', {
                          minifySelectors: false
                        }]
                      })
                    ] : [require('autoprefixer')()]
                  })()
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  outputStyle: 'expanded'
                },
                sourceMap: ! isProduction
              }
            }
          ]
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ],
              plugins: [
                '@babel/plugin-transform-spread',
                '@babel/plugin-proposal-object-rest-spread'
              ]
            }
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          exclude: /fonts/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
                publicPath: '..' // use relative urls
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: ! isProduction,
                mozjpeg: {
                  progressive: true,
                  quality: 65
                },
                optipng: {
                  enabled: false
                },
                pngquant: {
                  quality: '65-90',
                  speed: 4
                },
                gifsicle: {
                  interlaced: false
                }
              }
            }
          ]
        },
        {
          test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          exclude: /images/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath: '..' // use relative urls
            }
          }]
        },
        {
          test: /.pdf(\?[a-z0-9]+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'files/',
              publicPath: '..' // use relative urls
            }
          }]
        },
        {
          test: /\.html$/,
          use: {
            loader: 'html-loader',
            options: {
              minimize: true,
              removeComments: true,
              collapseWhitespace: true,
              removeScriptTypeAttributes: true,
              removeStyleTypeAttributes: true
            }
          },
        }
      ]
    },

    devServer: {
      proxy: {
        '/': {
          target: {
            host: "localhost",
            protocol: "http:",
            port: 8000
          },
          changeOrigin: true,
          secure: false
        }
      }
    },

    plugins: (() => {
      let common = [
        new plugins.extractCSS({
          filename: 'styles/[name].css'
        }),
        // new plugins.html({
        //   template: 'index.html',
        //   filename: 'index.html',
        //   minify: {
        //     removeScriptTypeAttributes: true,
        //     removeStyleLinkTypeAttributes: true
        //   }
        // }),
        new plugins.copy({ 
          patterns: [
            { from: 'images', to: 'images', noErrorOnMissing: true },
            { from: 'fonts', to: 'fonts', noErrorOnMissing: true },
            { from: 'files', to: 'files', noErrorOnMissing: true }
          ]
        }),
        new plugins.progress({
          color: '#5C95EE'
        })
      ]

      const production = [
        new plugins.clean(['dist']),
        new plugins.copy({ 
          patterns: [
            {
              from: 'data/**/*.json',
              // to: '',
              transform: content => {
                return minJSON(content.toString())
              },
              noErrorOnMissing: true
            }
          ]
        }),
        new plugins.sri({
          hashFuncNames: ['sha384'],
          enabled: true
        })
      ]

      const development = [
        new plugins.sync(
          {
            proxy: 'http://localhost:8080',
            files: [
              {
                match: [
                  '**/*.php',
                  '**/*.phtml',
                  '**/*.html'
                ],
                fn: function(event, file) {
                  if (event === "change") {
                    const bs = require('browser-sync').get('bs-webpack-plugin');
                    bs.reload();
                  }
                }
              }
            ]
          },
          {
            reload: true
          }
        )
      ]

      return isProduction
        ? common.concat(production)
        : common.concat(development)
    })(),

    devtool: (() => {
      return isProduction
        ? 'hidden-nosources-source-map' // 'hidden-source-map'
        : 'inline-source-map'
    })(),

    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {
        '~': path.resolve(__dirname, 'src/scripts/')
      }
    }
  }

  return config
};
