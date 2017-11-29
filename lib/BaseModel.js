let squel = require('squel').useFlavour('postgres');

function generate(pool) {
  /**
  * A `Model` essentially represents a row in the database, but in JS land.
  * Models are returned by `Collection`s, and can be persisted back to the database
  */
	class BaseModel {
		constructor() {}
		static get table() {
			throw new Error('A model must be backed by a table, but this one is not');
		}

		/**
		* Convert a row from `pg` into an instance of this model
		* @param {Object} row - a row from `pg`
		*/
		static fromSqlRow(row) {
			throw new Error('Must implement `fromSqlRow`');
		}

		/**
		* An object which holds mappings from the fields of this model (keys) to columns of the database (values)
		*/
		static get fieldMap() {
			throw new Error('Must implement `fieldMap`');
		}

		/**
		* Generate SQL for saving an instance of this model to the database
    * Note that it will always generate a postgres `upsert` query
		*/
		saveSql() {
			let table = this.constructor.table;
			let fm = this.constructor.fieldMap;

			let q = squel.insert()
				.into(table.tableName);

			let conflictObject = {};

			Object.keys(fm).forEach(k => {
				if (!this[k]) {
					return;
				}

				conflictObject[fm[k]] = this[k];

				q.set(fm[k], this[k]);
			});

			q.onConflict(table.pkey, conflictObject)

			return q.toString();
		}

		/**
		* Perform the upsert described by `saveSql`
		*/
		async save() {
			return pool.query(this.saveSql);
		}
	}

	return BaseModel;
}

module.exports = generate;