/// <reference types="react" />

export declare interface _AnyExtra {}

export declare type _BaseExtraFields = Record<string, any>;

export declare interface _BaseModuleTypeDefinition<
  k extends Kind = 'widget',
  ExtraField extends _BaseExtraFields = {},
> {
  moduleKind: k;
  extraFields?: ExtraField;
}

export declare type _BaseTypeDefinitions<
  Modules extends Record<string, _BaseModuleTypeDefinition<any, any>> = any,
> = {
  [Name in keyof Modules]: _BaseModuleTypeDefinition<
    Modules[Name]['moduleKind'],
    Modules[Name]['extraFields']
  >;
};

export declare interface _Context {
  needProvider(provider: ModuleSelector): void;
  getModule(selector: ModuleSelector): Promise<_ContextModule>;
  addModule(definition: _ModuleDefinition): void;
}

export declare interface _ContextModule<
  ModuleNames extends ModuleSelector = ModuleSelector,
> {
  addOutlet(outlet: ModuleNames, config?: OutletConfig): void;
}

export declare function createInjsxtion<
  TypeDefinitions extends _BaseTypeDefinitions,
>(): Injsxtion<TypeDefinitions>;

export declare function createModule<
  ID extends ModuleId,
  Extra extends _AnyExtra,
>(definition: _ModuleDefinition<ID, Extra>): Extra & Module;

export declare type Depth = number;

declare type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

export declare type _FilterModuleNamesByKind<
  Tds extends _BaseTypeDefinitions,
  Name extends _ModuleNames<Tds>,
  K extends Kind,
> = Name extends any
  ? Equal<_GetModuleKindByName<Tds, Name>, K> extends true
    ? Name
    : never
  : never;

export declare type _GetExtraFieldsByName<
  Tds extends _BaseTypeDefinitions,
  Name extends _ModuleNames<Tds>,
> = Tds[Name]['extraFields'];

export declare type _GetModuleKindByName<
  Tds extends _BaseTypeDefinitions,
  Name extends _ModuleNames<Tds>,
> = Tds[Name]['moduleKind'];

export declare interface Injsxtion<Tds extends _BaseTypeDefinitions> {
  defineWidget<Name extends _ModuleNames<Tds>>(
    name: Name,
  ): _ModuleBuilder<Tds, Name>;
  defineProvider<Name extends _ProviderNames<Tds>>(
    name: Name,
  ): _ModuleBuilder<Tds, Name>;
}

declare type IsExtrasFulfilled<Extras, ResolvedKeys> = IsNever<
  Exclude<RequiredFields<Extras>, ResolvedKeys>
>;

declare type IsNever<T> = [T] extends [never] ? true : false;

declare type IsOptional<T, K extends keyof T> =
  Partial<Pick<T, K>> extends Pick<T, K> ? true : false;

export declare type Kind = 'provider' | 'widget';

export declare interface Module {
  register(): Promise<void>;
  render(): JSX.Element | JSX.Element[];
}

export declare type _ModuleBuilder<
  Tds extends _BaseTypeDefinitions,
  Name extends _ModuleNames<Tds>,
  ResolvedKeys extends keyof _GetExtraFieldsByName<Tds, Name> = never,
> = Omit<
  ModuleBuilderProto<Tds, Name, ResolvedKeys>,
  IsExtrasFulfilled<_GetExtraFieldsByName<Tds, Name>, ResolvedKeys> extends true
    ? never
    : 'build'
>;

declare interface ModuleBuilderProto<
  Tds extends _BaseTypeDefinitions,
  Name extends _ModuleNames<Tds>,
  ResolvedKeys extends keyof _GetExtraFieldsByName<Tds, Name> = never,
> {
  addModule<N extends _ModuleNames<Tds>>(
    definition: _ModuleDefinition<N, _GetExtraFieldsByName<Tds, N>>,
  ): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  needProvider(
    name: _ProviderNames<Tds>,
  ): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  with(
    fn: (
      self: _ContextModule<_ModuleNames<Tds>> &
        _GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  with<N extends _ModuleNames<Tds>>(
    name: N,
    fn: (
      module: _ContextModule<_ModuleNames<Tds>> & _GetExtraFieldsByName<Tds, N>,
      self: _ContextModule<_ModuleNames<Tds>> &
        _GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  extra<EK extends keyof _GetExtraFieldsByName<Tds, Name>>(
    name: EK,
    value: _GetExtraFieldsByName<Tds, Name>[EK],
  ): _ModuleBuilder<Tds, Name, ResolvedKeys | EK>;
  extras<E extends Partial<_GetExtraFieldsByName<Tds, Name>>>(
    get: ValueOrGetter<E>,
  ): _ModuleBuilder<Tds, Name, ResolvedKeys | keyof E>;
  render(
    render: (
      outlet: JSX.Element[],
      extra: _GetExtraFieldsByName<Tds, Name>,
    ) => JSX.Element | JSX.Element[],
  ): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  depth(dep: Depth): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  order(ord: Order): _ModuleBuilder<Tds, Name, ResolvedKeys>;
  build(): _ModuleDefinition<Name, _GetExtraFieldsByName<Tds, Name>>;
}

export declare interface _ModuleDefinition<ID = ModuleId, Extra = Object> {
  id: ID;
  kind: Kind;
  depth?: Depth;
  order?: Order;
  register(context: _Context): Promise<void>;
  render(outlet: JSX.Element[], extra: Extra): JSX.Element | JSX.Element[];
  getExtraFields?(): Extra;
}

export declare type ModuleId = string;

export declare type _ModuleNames<Tds extends _BaseTypeDefinitions> = string &
  keyof Tds;

export declare type ModuleSelector = ModuleId;

export declare type _ModuleTypeDefinition<
  K extends Kind,
  ExtraField extends _BaseExtraFields = {},
> = {
  moduleKind: K;
  extraFields: ExtraField;
};

export declare type Order = number;

export declare interface Outlet {
  module: ModuleSelector;
  order?: Order;
}

export declare interface OutletConfig {
  order?: Order;
}

export declare type _ProviderNames<Tds extends _BaseTypeDefinitions> =
  _FilterModuleNamesByKind<Tds, _ModuleNames<Tds>, 'provider'>;

export declare type ProviderTypeDefinition<
  ExtraField extends _BaseExtraFields = {},
> = _ModuleTypeDefinition<'provider', ExtraField>;

declare type RequiredFields<T> = {
  [K in keyof T]-?: IsOptional<T, K> extends true ? never : K;
}[keyof T];

declare type ValueOrGetter<T> = T | (() => T);

export declare type _WidgetNames<Tds extends _BaseTypeDefinitions> =
  _FilterModuleNamesByKind<Tds, _ModuleNames<Tds>, 'widget'>;

export declare type WidgetTypeDefinition<
  ExtraField extends _BaseExtraFields = {},
> = _ModuleTypeDefinition<'widget', ExtraField>;

export declare type _WithModuleTypeDefinition<
  Name extends string,
  K extends Kind,
  ExtraField extends _BaseExtraFields = {},
> = Record<Name, _ModuleTypeDefinition<K, ExtraField>>;

export declare type WithProviderTypeDefinition<
  Name extends string,
  ExtraField extends _BaseExtraFields = {},
> = _WithModuleTypeDefinition<Name, 'provider', ExtraField>;

export declare type WithWidgetTypeDefinition<
  Name extends string,
  ExtraField extends _BaseExtraFields = {},
> = _WithModuleTypeDefinition<Name, 'widget', ExtraField>;

export {};
