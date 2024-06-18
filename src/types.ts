export type Kind = 'provider' | 'widget';
export type ModuleId = string;
export type ModuleSelector = ModuleId;

export type Depth = number;
export type Order = number;

export interface Outlet {
  module: ModuleSelector;
  order?: Order;
}
export interface OutletConfig {
  order?: Order;
}

export interface Module {
  register(): Promise<void>;
  render(): JSX.Element | JSX.Element[];
}

export interface ContextModule<
  ModuleNames extends ModuleSelector = ModuleSelector,
> {
  addOutlet(outlet: ModuleNames, config?: OutletConfig): void;
}

export interface Context {
  needProvider(provider: ModuleSelector): void;
  getModule(selector: ModuleSelector): Promise<ContextModule>;
  addModule(definition: ModuleDefinition): void;
}

export interface ModuleDefinition<ID = ModuleId, Extra = Object> {
  id: ID;
  kind: Kind;
  depth?: Depth;
  order?: Order;
  register(context: Context): Promise<void>;
  render(outlet: JSX.Element[], extra: Extra): JSX.Element | JSX.Element[];
  getExtraFields?(): Extra;
}
