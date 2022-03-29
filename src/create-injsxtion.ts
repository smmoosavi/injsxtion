import {
  BaseTypeDefinitions,
  GetExtraFieldsByName,
  ModuleBuilder,
  ModuleBuilderProto,
  ModuleNames,
  ProviderNames,
  Injsxtion,
  ValueOrGetter,
} from './injsxtion-types';
import {
  Context,
  ContextModule,
  Depth,
  Kind,
  ModuleDefinition,
  Order,
} from './types';

type NameAndFn<
  Tds extends BaseTypeDefinitions,
  N extends ModuleNames<Tds>,
  Name extends ModuleNames<Tds>,
> =
  | {
      name: N;
      fn: (
        module: ContextModule & GetExtraFieldsByName<Tds, Name>,
        self: ContextModule & GetExtraFieldsByName<Tds, Name>,
      ) => void;
    }
  | {
      name: null;
      fn: (self: ContextModule & GetExtraFieldsByName<Tds, Name>) => void;
    };

interface ModuleBuilderInner<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
> {
  id: Name;
  kind: Kind;
  depth?: Depth;
  order?: Order;
  modules: Array<ModuleDefinition<any, GetExtraFieldsByName<Tds, any>>>;
  extraFields: Array<ValueOrGetter<Partial<GetExtraFieldsByName<Tds, Name>>>>;
  withs: Array<NameAndFn<Tds, string, string>>;
  providers: Array<ModuleNames<Tds>>;
  render?: (
    outlets: JSX.Element[],
    extra: GetExtraFieldsByName<Tds, Name>,
  ) => JSX.Element | JSX.Element[];
  resolvedKeys?: ResolvedKeys;
}

interface WithModuleBuilderInner<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
> {
  inner: ModuleBuilderInner<Tds, Name, ResolvedKeys>;
}

function createModuleBuilder<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
>(
  inner: ModuleBuilderInner<Tds, Name, ResolvedKeys>,
): ModuleBuilder<Tds, Name, ResolvedKeys> &
  WithModuleBuilderInner<Tds, Name, ResolvedKeys> {
  return Object.assign(Object.create(moduleBuilderProto), { inner });
}

function createModuleBuilderProto<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
  ResolvedKeys extends keyof GetExtraFieldsByName<Tds, Name> = never,
>(): ModuleBuilderProto<Tds, Name, ResolvedKeys> {
  type This<R extends keyof GetExtraFieldsByName<Tds, Name> = ResolvedKeys> =
    ModuleBuilder<Tds, Name, R> & WithModuleBuilderInner<Tds, Name, R>;
  function depth(this: This, dep: Depth): This {
    return createModuleBuilder({
      ...this.inner,
      depth: dep,
    });
  }

  function order(this: This, ord: Order): This {
    return createModuleBuilder({
      ...this.inner,
      order: ord,
    });
  }
  function extra<EK extends keyof GetExtraFieldsByName<Tds, Name>>(
    this: This,
    name: EK,
    value: GetExtraFieldsByName<Tds, Name>[EK],
  ): This<ResolvedKeys | EK> {
    const newExtraFields = { [name]: value } as Partial<
      Pick<GetExtraFieldsByName<Tds, Name>, EK>
    >;
    return createModuleBuilder<Tds, Name, ResolvedKeys | EK>({
      ...this.inner,
      extraFields: [...this.inner.extraFields, newExtraFields],
    });
  }
  function extras<E extends Partial<GetExtraFieldsByName<Tds, Name>>>(
    this: This,
    getOrValue: E | (() => E),
  ): This<keyof E | ResolvedKeys> {
    return createModuleBuilder<Tds, Name, keyof E | ResolvedKeys>({
      ...this.inner,
      extraFields: [...this.inner.extraFields, getOrValue],
    });
  }

  function addModule<N extends ModuleNames<Tds>>(
    this: This,
    definition: ModuleDefinition<N, GetExtraFieldsByName<Tds, N>>,
  ): This {
    return createModuleBuilder({
      ...this.inner,
      modules: [...this.inner.modules, definition],
    });
  }

  function _with(
    fn: (self: ContextModule & GetExtraFieldsByName<Tds, Name>) => void,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  function _with<N extends ModuleNames<Tds>>(
    name: N,
    fn: (
      module: ContextModule & GetExtraFieldsByName<Tds, N>,
      self: ContextModule & GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): ModuleBuilder<Tds, Name, ResolvedKeys>;
  function _with<N extends ModuleNames<Tds>>(
    this: This,
    nameOrFn:
      | N
      | ((self: ContextModule & GetExtraFieldsByName<Tds, Name>) => void),
    fn?: (
      module: ContextModule & GetExtraFieldsByName<Tds, N>,
      self: ContextModule & GetExtraFieldsByName<Tds, Name>,
    ) => void,
  ): ModuleBuilder<Tds, Name, ResolvedKeys> {
    if (typeof nameOrFn === 'function') {
      return createModuleBuilder({
        ...this.inner,
        withs: [
          ...this.inner.withs,
          {
            name: null,
            fn: nameOrFn,
          },
        ],
      });
    } else {
      return createModuleBuilder({
        ...this.inner,
        withs: [
          ...this.inner.withs,
          {
            name: nameOrFn,
            fn: fn!,
          },
        ],
      });
    }
  }

  function needProvider(this: This, name: ProviderNames<Tds>): This {
    return createModuleBuilder({
      ...this.inner,
      providers: [...this.inner.providers, name],
    });
  }

  function render(
    this: This,
    render: (
      outlet: JSX.Element[],
      extra: GetExtraFieldsByName<Tds, Name>,
    ) => JSX.Element | JSX.Element[],
  ): This {
    return createModuleBuilder({
      ...this.inner,
      render,
    });
  }

  function build(
    this: This,
  ): ModuleDefinition<Name, GetExtraFieldsByName<Tds, Name>> {
    const inner = this.inner;
    return {
      id: inner.id,
      depth: inner.depth,
      kind: inner.kind,
      order: inner.order,
      render(outlet, extra): JSX.Element | JSX.Element[] {
        if (inner.render) {
          return inner.render(outlet, extra);
        }
        return outlet;
      },
      getExtraFields(): GetExtraFieldsByName<Tds, Name> {
        const extraFields = {};
        inner.extraFields.forEach((g) => {
          const value = typeof g === 'function' ? g() : g;
          Object.assign(extraFields, value);
        });
        return extraFields;
      },
      async register(context: Context): Promise<void> {
        inner.modules.forEach((module) => context.addModule(module));
        inner.providers.forEach((provider) => context.needProvider(provider));
        const self = await context.getModule(inner.id);
        for (const fn of inner.withs) {
          if (fn.name === null) {
            fn.fn(self);
          } else {
            const mod = await context.getModule(fn.name);
            if (mod) {
              fn.fn(mod, self);
            }
          }
        }
      },
    };
  }

  return {
    depth,
    order,
    extra,
    extras,
    addModule,
    with: _with,
    needProvider,
    render,
    build,
  };
}

const moduleBuilderProto = /* #__PURE__ */ createModuleBuilderProto();

function defineModuleWithKind<
  Tds extends BaseTypeDefinitions,
  Name extends ModuleNames<Tds>,
>(kind: Kind, name: Name): ModuleBuilder<Tds, Name> {
  const inner: ModuleBuilderInner<Tds, Name> = {
    id: name,
    kind,
    providers: [],
    modules: [],
    extraFields: [],
    withs: [],
  };
  return createModuleBuilder(inner);
}
export function createInjsxtion<
  TypeDefinitions extends BaseTypeDefinitions,
>(): Injsxtion<TypeDefinitions> {
  type Tds = TypeDefinitions;

  function defineWidget<Name extends ModuleNames<Tds>>(
    name: Name,
  ): ModuleBuilder<Tds, Name> {
    return defineModuleWithKind('widget', name);
  }
  function defineProvider<Name extends ModuleNames<Tds>>(
    name: Name,
  ): ModuleBuilder<Tds, Name> {
    return defineModuleWithKind('provider', name);
  }
  return {
    defineWidget,
    defineProvider,
  };
}
