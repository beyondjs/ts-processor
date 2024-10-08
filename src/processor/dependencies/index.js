const ProcessorAnalyzerDependencies = require('@beyond-js/bundles-sdk/processor/base/dependencies/analyzer');
const Declarations = require('@beyond-js/ts-processor/processor/depenencies/declarations');

module.exports = class extends ProcessorAnalyzerDependencies {
	get dp() {
		return 'ts.dependencies';
	}

	#declarations;
	get declarations() {
		return this.#declarations;
	}

	constructor(processor) {
		super(processor);
		this.#declarations = new Declarations(this);
	}

	_update() {
		const { errors, updated } = super._update();
		if (errors?.length) return { errors };

		// Processor 'ts' requires '@beyond-js/kernel/bundle' as a dependency, except itself
		(() => {
			const core = '@beyond-js/kernel/bundle';

			const { bundle } = this.processor.specs;
			if ([core].includes(bundle.specifier) || updated.has(core)) return;

			if (this.has(core)) {
				const bundle = this.get(core);
				bundle.is.add('import');
				updated.set(core, bundle);
				return;
			}

			const dependency = this._create(core);
			dependency.is.add('import');
			updated.set(core, dependency);
		})();

		return { updated };
	}

	destroy() {
		super.destroy();
		this.#declarations.destroy();
	}
};
