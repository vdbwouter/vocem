# Vocem

**NOTE**: This project is no longer maintained. You might want to consider using an alternative.

[![build status](https://gitlab.com/woutervdb/Vocem/badges/master/build.svg)](https://gitlab.com/woutervdb/Vocem/commits/master)
[![CircleCI](https://circleci.com/gh/vdbwouter/vocem.svg?style=svg)](https://circleci.com/gh/vdbwouter/vocem)
[![Build Status](https://travis-ci.org/vdbwouter/vocem.svg?branch=master)](https://travis-ci.org/vdbwouter/vocem)

Vocem is an open-source logging utility, which aims to be extensible
and easy-to-use.

If you have any suggestions or bug reports, feel
free to open an issue at [GitLab](https://gitlab.com/woutervdb/Vocem)
or [GitHub](https://github.com/vdbwouter/Vocem).

## TypeScript support

Vocem is written in TypeScript and as such has TypeScript support.

## Examples

Let's say you want to log to console. A simple way to do this is

```js
import * as vocem from 'vocem'  
let logger = vocem.logger(console)
```

You start using it immediately.

```js
logger.info('Hello World!')
```

Now you decide you want to add the current date and time to the output.
This can be done like

```js
logger.prop({date: true})
```

Now something bad has happened, so you need to inform the user. No problem.

```js
logger.warn("It's a trap!")
```

You decide you want to write to a file and write the log level, too.
This can easily be done in the following way

```js
logger.add(vocem.file('my-log-file.txt')).prop({level: true})
```

The warning turned into an error, so you need to inform the user.

```js
logger.error('Help! %s has happened!', 'Something really bad')
```

Now you want to be able to keep a history of your log files in the `log/`
directory, but you only want to keep the last five files. This, too, is
very easy

```js
logger.add(vocem.history('log/', {keep: 5}))
```

You are bored with the logging options provided by default, so you decide
to add a new one.

```js
vocem.register('special', function (message, level, propertyValue) {
  return util.format('[%s/%s] %s', propertyValue, level, message)
})

logger.prop({special: 'special'})
```

Now you realize your special options is really doing nothing, which means
you could just as well remove it.

```js
vocem.deregister('special')
```

You realize outputting the log level is no longer wanted, so you
disable that.

```js
logger.unprop('level')
```

Now you decide you've had enough of logging, so you want to get rid of
the logger. All you need to do is call

```js
logger.destroy()
```

A while later you realize you need another logger. You want to add some
fancy colors, but only to the console. You want to keep it simple,
however, so you do as follows

```js
let newLogger = vocem.logger(
  vocem.object(console, {color: true}),
  vocem.file('my-log-file.txt'),
  vocem.history('log/', {keep: 5})
).prop({date:true, level: true})
```

And at the end of the day, you destroy the logger again.

```js
newLogger.destroy()
```

## Documentation

All top-level methods are part of the `vocem` object.

### `logger(output...)`

Create a `logger` instance which outputs to every given `output`.

### `file(fileName, [properties], [callback])`

Create an output which writes to the file with the given `fileName`.

The callback is called when an error has occured or when the output has
successfully been created. It will be called as follows:
`callback(error, output)`

_Note: `file` returns an object which can be written to, but it will only
perform the actual write once the file has been opened._

**WARNING: Will overwrite the file, even if nothing is written**

Also applies the given `properties` to this output.

The supported properties are those listed in [output::prop](#outputpropproperties)
and the following:

* `destroy`: If this property has as value false _at the moment of destruction_,
  this output will not be destroyed.

  **WARNING**: This means the file being written to will **not** be closed.
  It is highly recommended to leave this property be.

### `history(directory, [properties], [callback])`

Create an output which will write a history of log files.

The callback is called when an error has occured or when the output has
successfully been created. It will be called as follows:
`callback(error, output)`.

_Note: `history` returns an object which can be written to, but it will only
perform the actual write once the file has been opened._

Also applies the given `properties` to this output.

The supported properties are those listed in [output::prop](#outputpropproperties)
and the following:

* `destroy`: If this property has as value false _at the moment of destruction_,
  this output will not be destroyed.

  **WARNING**: This means the file being written to will **not** be closed.
  It is highly recommended to leave this property be.
* `keep`: Specify the maximum number of files to keep in the history.
* `dateFormat`: Specify the date format for [moment][moment] to use.

_Note: `keep` and `dateFormat` can only be applied upon creation._

### `object(object, [properties])`

Create an output which writes to an object. An alternative to just passing the
object, but necessary if you want to apply object-specific `properties`.

The supported properties are those listed in [output::prop](#outputpropproperties)
and the following:

* `destroy`: If this property has as value false _at the moment of destruction_,
  this output will not be destroyed.

### `register(name, handler)`

Registers a new property with a given `handler`. The `handler` is
called with the `message`, `level` and `propertyValue`. If a given
property already exists, an error is thrown.

### `deregister(name...)`

Removes every property named within the array. The handler for this
properties will not be called anymore by any outputs.


### `output::info(message, [params])`

Outputs the message with level `info` to the outputs. `message` will
be treated as a format string for `util::format`.

Properties are handled from latest to earliest, so the last added property is the
first property to be handled.

### `output::warn(message, [params])`

Like [output::info](#outputinfomessage-params), but with level `warn`.

### `output::error(message, [params])`

Like [output::info](#outputinfomessage-params), but with level `error`.

### `output::prop(properties)`

Add the `properties` to the output properties.
The properties are in the form `{name: value}`.

By default, the following properties are supported for this method:

* `level`: Outputs the log level along with the message.
* `color`: Adds color to the message using [chalk][chalk].
* `date`: Adds the current date using [moment][moment].

  If you want to use another format string, you can specify this by
  changing the property value.

### `output::unprop((property | filter)...)`

Remove every `property` from the list of output properties. A filter can be
passed instead of a property name. In that case, all the properties that pass
the filter are removed.

### `output::destroy()`

Destroys the output.


### `Logger::add(output...)`

Add the new `output`s to the logger output.

### `Logger::remove(filter...)`

Removes all outputs that passany of the filters.

### `Logger::outputs(iterator)`

Iterates over every output of the logger with the given iterator.

[moment]: https://www.npmjs.com/package/moment
[chalk]: https://www.npmjs.com/package/chalk
