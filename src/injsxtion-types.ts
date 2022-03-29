import { Equal, IsNever, RequiredFields } from './utils/type-utils';
import { ContextModule, Depth, Kind, ModuleDefinition, Order } from './types';

// Tds: TypeDefinitions

export type WithModuleTypeDefinition<
  Name extends string,
  K extends Kind,
  ExtraField extends BaseExtraFields = {},
> = Record<Name, ModuleTypeDefinition<K, ExtraField>>;
export type ModuleTypeDefinition<
  K extends Kind,
  ExtraField extends BaseExtraFields = {},
> = { moduleKind: K; extraFields: ExtraField };

export type WithProviderTypeDefinition<
  Name extends string,
  ExtraField extends BaseExtraFields = {},
> = WithModuleTypeDefinition<Name, 'provider', ExtraField>;
export type ProviderTypeDefinition<ExtraField extends BaseExtraFields = {}> =
  ModuleTypeDefinition<'provider', ExtraField>;

export type WithWidgetTypeDefinition<
  Name extends string,
  ExtraField extends BaseExtraFields = {},
> = WithModuleTypeDefinition<Name, 'widget', ExtraField>;
export type WidgetTypeDefinition<ExtraField extends BaseExtraFields = {}> =
  ModuleTypeDefinition<'widget', ExtraField>;

export type BaseExtraFields = Record<string, any>;
export interface BaseModuleTypeDefinition<
  k extends Kind = 'widget',
  ExtraField extends BaseExtraFields = {},
> {
  moduleKind: k;
  extraFields?: ExtraField;
}
export type BaseTypeDefinitions<
  Modules extends Record<string, BaseModuleTypeDefinition<any, any>> = any,
> = {
  [Name in keyof Modules]: BaseModuleTypeDefinition<
    Modules[Name]['moduleKind'],
    Modules[Name]['extraFields']
  >;
};

export type ValueOrGetter<T> = T | (() => T);
export type ModuleNames<Tds extends BaseTypeDefinitions> = string & keyof Tds;
export type ProviderNames<Tds extends BaseTypeDefinitions> =
  FilterModuleNamesByKind<Tds, ModuleNames<Tds>, 'provider'>;
export type WidgetNames<Tds extends BaseTypeDefinitions> =
  FilterModuleNamesByKind<Tds, ModuleNames<Tds>, 'widget'>;

export type FilterModuleNamesByKind<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  K extends Kind,
> = Name extends any
  ? Equal<GetModuleKindByName<Tds, Name>, K> extends true
    ? Name
    : never
  : never;

export type GetModuleKindByName<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
> = Tds[Name]['moduleKind'];
export type GetExtraFieldsByName<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
> = Tds[Name]['extraFields'];

/* -- module builder -- */

type IsExtrasFulfilled<Extras, ResolvedKeys> = IsNever<
  Exclude<RequiredFields<Extras>, ResolvedKeys>
>;

export interface ModuleBuilderProto<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
> {
  addModule<N extends ModuleNames<Tds>>(
    definition: ModuleDefinition<N, GetExtraFieldsByName<Tds, N>>,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  needProvider(
    name: ProviderNames<Tds>,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  with(
    fn: (
      self: ContextModule<ModuleNames<Tds>> & GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  with<N extends ModuleNames<Tds>>(
    name: N,
    fn: (
      module: ContextModule<ModuleNames<Tds>> & GetExtraFieldsByName<Tds, N>,
      self: ContextModule<ModuleNames<Tds>> & GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  extra<EK extends keyof GetExtraFieldsByName<Tds, Name>>(
    name: EK,
    value: GetExtraFieldsByName<Tds, Name>[EK],
  ): ModuleBuilder<Tds, Name, ResolvedKeys | EK>;
  extras<E extends Partial<GetExtraFieldsByName<Tds, Name>>>(
    get: ValueOrGetter<E>,
  ): ModuleBuilder<Tds, Name, ResolvedKeys | keyof E>;
  render(
    render: (
      outlet: JSX.Element[],
      extra: GetExtraFieldsByName<Tds, Name>,
    ) => JSX.Element | JSX.Element[],
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  depth(dep: Depth): ModuleBuilder<Tds, Name, ResolvedKeys>;
  order(ord: Order): ModuleBuilder<Tds, Name, ResolvedKeys>;
  build(): ModuleDefinition<Name, GetExtraFieldsByName<Tds, Name>>;
}

export type ModuleBuilder<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
> = Omit<
  ModuleBuilderProto<Tds, Name, ResolvedKeys>,
  IsExtrasFulfilled<GetExtraFieldsByName<Tds, Name>, ResolvedKeys> extends true
    ? never
    : 'build'
>;

/* -- Injsxtion -- */
export interface Injsxtion<Tds extends BaseTypeDefinitions> {
  defineWidget<Name extends ModuleNames<Tds>>(
    name: Name,
  ): ModuleBuilder<Tds, Name>;
  defineProvider<Name extends ProviderNames<Tds>>(
    name: Name,
  ): ModuleBuilder<Tds, Name>;
}
