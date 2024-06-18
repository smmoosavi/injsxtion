import {
  Context,
  ContextModule,
  Module,
  ModuleDefinition,
  ModuleId,
  ModuleSelector,
  Outlet,
  OutletConfig,
} from './types';
import { defer, Deferred } from './utils/defer';
import { sortBy } from './utils/sort-by';
import { appendToMap } from './utils/map';
import { Edge, sortProviders } from './utils/sort-providers';
import { AnyExtra } from './injsxtion-types';

interface InnerModule<ID = ModuleId, Extra = AnyExtra> {
  id: ID;
  addOutlet(outlet: ModuleSelector, config: OutletConfig): void;
  register(): Promise<void>;
  render(): JSX.Element | JSX.Element[];
  extra: Extra;
  definition: ModuleDefinition<ID, Extra>;
}

interface State {
  modules: Map<ModuleId, InnerModule>;
  deferreds: Map<ModuleId, Deferred<InnerModule>>;
  providers: Map<ModuleId, Array<ModuleSelector>>;
  outlets: Map<ModuleId, Array<Outlet>>;
}

function _renderOutlets(state: State, id: ModuleId): JSX.Element[] {
  const outlets = state.outlets.get(id) ?? [];

  const mods = sortBy(outlets, (outlet) => outlet.order ?? 0).map((outlet) => {
    let mod = state.modules.get(outlet.module);
    if (!mod) {
      throw new Error(`Module ${outlet.module} not found`);
    }
    return mod;
  });
  return mods.flatMap((module, index) => module.render());
}

function _appendProviderAsOutlet(state: State, modules: ModuleId[]) {
  if (modules.length === 1) {
    return;
  }
  const [cur, ...rest] = modules;
  const nextModuleID = rest[0];
  const NextModuleOrder = state.modules.get(nextModuleID)!.definition.order;
  appendToMap(state.outlets, cur, {
    module: nextModuleID,
    order: NextModuleOrder,
  });
  _appendProviderAsOutlet(state, rest);
}

function _registerProvidersAsOutlet(
  state: State,
  providers: ModuleId[],
  childModule: ModuleId,
) {
  if (providers.length === 0) {
    return childModule;
  }

  _appendProviderAsOutlet(state, [...providers, childModule]);
  const [moduleId] = providers;
  return moduleId;
}

async function _getModule(
  state: State,
  selector: ModuleSelector,
): Promise<InnerModule> {
  if (state.modules.has(selector)) {
    return state.modules.get(selector)!;
  }
  const deferred = defer<InnerModule>();
  state.deferreds.set(selector, deferred);
  return deferred.promise;
}

function _createContext(state: State, id: ModuleId): Context {
  async function getModule(selector: ModuleSelector): Promise<ContextModule> {
    return _getModule(state, selector).then((module) => ({
      ...module.extra,
      ...module,
    }));
  }
  function addModule(def: ModuleDefinition) {
    if (state.modules.has(def.id)) {
      throw new Error(`Module ${def.id} already exists`);
    }
    const mod = _createModule(state, def);
    state.modules.set(def.id, mod);
    if (state.deferreds.has(def.id)) {
      state.deferreds.get(def.id)!.resolve(mod);
      state.deferreds.delete(def.id);
    }
  }
  function needProvider(provider: ModuleSelector) {
    appendToMap(state.providers, id, provider);
  }
  return {
    getModule,
    addModule,
    needProvider,
  };
}

function _createModule<ID extends ModuleId, Extra>(
  state: State,
  definition: ModuleDefinition<ID, Extra>,
): InnerModule<ID, Extra> {
  const context: Context = _createContext(state, definition.id);

  const addOutlet = (outlet: ModuleSelector, config?: OutletConfig): void => {
    appendToMap(state.outlets, definition.id, { module: outlet, ...config });
  };
  const register = async (): Promise<void> => {
    await definition.register(context);
  };
  const extra = definition.getExtraFields?.()!;
  const render = (): JSX.Element | JSX.Element[] => {
    return definition.render(_renderOutlets(state, definition.id), extra);
  };
  return {
    id: definition.id,
    extra,
    definition,
    addOutlet,
    register,
    render,
  };
}

function _getSortedProviders(state: State) {
  const edges: Edge[] = [...state.providers.entries()].flatMap<Edge>(
    ([a, moduleProviders]) => moduleProviders.map<Edge>((p) => [a, p]),
  );
  const priority: Record<string, number> = {};
  state.modules.forEach((module) => {
    priority[module.id] = module.definition.depth ?? 0;
  });

  return sortProviders(edges, priority);
}

function _createState(): State {
  const mods = new Map<string, InnerModule>();
  const deferreds = new Map<string, Deferred<InnerModule>>();
  const providers = new Map<string, Array<ModuleSelector>>();
  const outlets = new Map<string, Array<Outlet>>();

  return {
    modules: mods,
    deferreds,
    providers,
    outlets,
  };
}

async function _registerModules(state: State) {
  for (const [, mod] of state.modules) {
    await mod.register();
  }
  for (const [id, deferred] of state.deferreds) {
    if (deferred.state === 'pending') {
      throw new Error(`Module ${id} not found`);
    }
  }
}

export function createModule<ID extends ModuleId, Extra extends AnyExtra>(
  definition: ModuleDefinition<ID, Extra>,
): Extra & Module {
  const state = _createState();
  const mod = _createModule(state, definition);
  state.modules.set(mod.id, mod);
  let root: ModuleId | null = null;

  const register = async (): Promise<void> => {
    await _registerModules(state);
    const providers = _getSortedProviders(state);
    root = _registerProvidersAsOutlet(state, providers, mod.id);
  };

  const render = (): JSX.Element | JSX.Element[] => {
    if (root === null) {
      throw new Error('Module not registered');
    }
    return state.modules.get(root)!.render();
  };

  return {
    ...mod.extra,
    id: mod.id,
    register: register,
    render: render,
  };
}
