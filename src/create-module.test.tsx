import { createModule } from './create-module';
import { render, screen, within } from '@testing-library/react';
import {
  WithWidgetTypeDefinition,
  WithProviderTypeDefinition,
} from './injsxtion-types';
import { createInjsxtion } from './create-injsxtion';
import { describe, expect, it } from 'vitest';

describe('module', function () {
  it('should render', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<'main'>;
    const r = createInjsxtion<ModuleTypeDefinitions>();
    const mainModuleDefinition = r
      .defineWidget('main')
      .render(() => <div data-testid="main">Hello</div>)
      .build();

    const mainModule = createModule(mainModuleDefinition);
    await mainModule.register();
    render(<>{mainModule.render()}</>);
    expect(screen.getByTestId('main')).toBeTruthy();
  });
  it('should register', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<'main'> &
      WithWidgetTypeDefinition<'root'>;

    const r = createInjsxtion<ModuleTypeDefinitions>();

    const rootModuleDefinition = r
      .defineWidget('root')
      .render(() => <div data-testid="root">hello</div>)
      .build();
    const mainModuleDefinition = r
      .defineWidget('main')
      .addModule(rootModuleDefinition)
      .with((self) => self.addOutlet('root'))
      .render((outlet) => <div data-testid="main">{...outlet}</div>)
      .build();

    const mainModule = createModule(mainModuleDefinition);
    await mainModule.register();
    render(<>{mainModule.render()}</>);
    expect(screen.getByTestId('main')).toBeTruthy();
    expect(within(screen.getByTestId('main')).getByTestId('root')).toBeTruthy();
  });
  it('should render outlet with order', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<'main'> &
      WithWidgetTypeDefinition<'root'> &
      WithWidgetTypeDefinition<'page1'> &
      WithWidgetTypeDefinition<'ad'>;

    const r = createInjsxtion<ModuleTypeDefinitions>();

    const rootModuleDefinition = r
      .defineWidget('root')
      .render((outlet) => <div data-testid="root">{...outlet}</div>)
      .build();
    const page1ModuleDefinition = r
      .defineWidget('page1')
      .with('root', (root) => root.addOutlet('page1', { order: 2 }))
      .render(() => <div data-testid="page1">page1</div>)
      .build();
    const adModuleDefinition = r
      .defineWidget('ad')
      .with('root', (root) => root.addOutlet('ad', { order: 1 }))
      .render(() => <div data-testid="ad">ad</div>)
      .build();
    const mainModuleDefinition = r
      .defineWidget('main')
      .addModule(rootModuleDefinition)
      .addModule(page1ModuleDefinition)
      .addModule(adModuleDefinition)
      .with((self) => self.addOutlet('root'))
      .render((outlet) => <div data-testid="main">{...outlet}</div>)
      .build();

    const mainModule = createModule(mainModuleDefinition);
    await mainModule.register();
    render(<>{mainModule.render()}</>);
    expect(screen.getByTestId('main')).toBeTruthy();
    expect(within(screen.getByTestId('main')).getByTestId('root')).toBeTruthy();
    expect(
      within(screen.getByTestId('root')).getByTestId('page1'),
    ).toBeTruthy();
    expect(within(screen.getByTestId('root')).getByTestId('ad')).toBeTruthy();
    const root = screen.getByTestId('root');
    expect(root.childNodes[0]).toBe(screen.getByTestId('ad'));
    expect(root.childNodes[1]).toBe(screen.getByTestId('page1'));
  });
  it('should render wrappers', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<'main'> &
      WithWidgetTypeDefinition<'root'> &
      WithWidgetTypeDefinition<'page1'> &
      WithProviderTypeDefinition<'theme-provider'> &
      WithProviderTypeDefinition<'i18n-provider'>;
    const r = createInjsxtion<ModuleTypeDefinitions>();

    const themeProviderDefinition = r
      .defineProvider('theme-provider')
      .depth(-100)
      .render((outlet) => <div data-testid="theme-provider">{...outlet}</div>)
      .build();
    const i18nProviderDefinition = r
      .defineProvider('i18n-provider')
      .render((outlet) => <div data-testid="i18n-provider">{...outlet}</div>)
      .build();
    const rootModuleDefinition = r
      .defineWidget('root')
      .render((outlet) => <div data-testid="root">{...outlet}</div>)
      .build();
    const page1ModuleDefinition = r
      .defineWidget('page1')
      .with('root', (root) => root.addOutlet('page1', { order: 2 }))
      .needProvider('i18n-provider')
      .needProvider('theme-provider')
      .render(() => <div data-testid="page1">page1</div>)
      .build();
    const mainModuleDefinition = r
      .defineWidget('main')
      .addModule(rootModuleDefinition)
      .addModule(page1ModuleDefinition)
      .addModule(i18nProviderDefinition)
      .addModule(themeProviderDefinition)
      .with((self) => self.addOutlet('root'))
      .render((outlet) => <div data-testid="main">{...outlet}</div>)
      .build();

    const mainModule = createModule(mainModuleDefinition);
    await mainModule.register();
    render(<>{mainModule.render()}</>);
    expect(screen.getByTestId('theme-provider')).toBeTruthy();
    expect(
      within(screen.getByTestId('theme-provider')).getByTestId('i18n-provider'),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('i18n-provider')).getByTestId('main'),
    ).toBeTruthy();
    expect(within(screen.getByTestId('main')).getByTestId('root')).toBeTruthy();
    expect(
      within(screen.getByTestId('root')).getByTestId('page1'),
    ).toBeTruthy();
    const root = screen.getByTestId('root');
    expect(root.childNodes[0]).toBe(screen.getByTestId('page1'));
  });
  it('should render outlet with extra', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<'main'> &
      WithWidgetTypeDefinition<
        'root',
        {
          setSize: (size: number) => void;
          getSize: () => number;
          color: string;
        }
      > &
      WithWidgetTypeDefinition<'page1'> &
      WithWidgetTypeDefinition<'ad'>;

    const r = createInjsxtion<ModuleTypeDefinitions>();

    const rootModuleDefinition = r
      .defineWidget('root')
      .render((outlet, extra) => {
        const size = extra.getSize();
        const color = extra.color;
        return (
          <div data-testid="root">
            <div data-testid="size">
              size: {size}, color: {color}
            </div>
            {...outlet}
          </div>
        );
      })
      .extra('color', 'red')
      .extras(() => {
        const sizeRef = { current: 0 };
        return {
          setSize: (size: number) => {
            sizeRef.current = size;
          },
          getSize: () => sizeRef.current,
        };
      })
      .build();
    const page1ModuleDefinition = r
      .defineWidget('page1')
      .with('root', (root) => {
        root.setSize(1);
        root.addOutlet('page1', { order: 2 });
      })
      .render(() => <div data-testid="page1">page1</div>)
      .build();
    const mainModuleDefinition = r
      .defineWidget('main')
      .addModule(rootModuleDefinition)
      .addModule(page1ModuleDefinition)
      .with((self) => self.addOutlet('root'))
      .render((outlet) => <div data-testid="main">{...outlet}</div>)
      .build();

    const mainModule = createModule(mainModuleDefinition);
    await mainModule.register();
    render(<>{mainModule.render()}</>);
    expect(screen.getByTestId('main')).toBeTruthy();
    expect(within(screen.getByTestId('main')).getByTestId('root')).toBeTruthy();
    expect(
      within(screen.getByTestId('root')).getByTestId('page1'),
    ).toBeTruthy();
    expect(within(screen.getByTestId('root')).getByTestId('size')).toBeTruthy();
    const root = screen.getByTestId('root');
    expect(root.childNodes[0]).toBe(screen.getByTestId('size'));
    expect(root.childNodes[1]).toBe(screen.getByTestId('page1'));
    expect(
      within(screen.getByTestId('root')).getByTestId('size').textContent,
    ).toBe('size: 1, color: red');
  });
  it('should reuse definition', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<
      'main',
      {
        name: string;
        getValues: () => number[];
        addValue: (value: number) => void;
      }
    >;

    const createExtras = () => {
      const valuesRef = { current: [] as number[] };
      return {
        getValues: () => valuesRef.current,
        addValue: (value: number) => {
          valuesRef.current.push(value);
        },
      };
    };

    const r = createInjsxtion<ModuleTypeDefinitions>();
    const mainModuleDefinition = r
      .defineWidget('main')
      .render((outlet, extra) => (
        <div data-testid={extra.name}>
          {extra.name}: {extra.getValues()}
        </div>
      ))
      .extras(createExtras);
    const def1 = mainModuleDefinition
      .with((self) => self.addValue(1))
      .extra('name', 'foo')
      .build();
    const def2 = mainModuleDefinition
      .with((self) => self.addValue(2))
      .extra('name', 'bar')
      .build();

    const mainModule1 = createModule(def1);
    await mainModule1.register();
    const mainModule2 = createModule(def2);
    await mainModule2.register();
    render(
      <>
        {mainModule1.render()}
        {mainModule2.render()}
      </>,
    );
    expect(screen.getByTestId('foo')).toBeTruthy();
    expect(screen.getByTestId('foo').textContent).toBe('foo: 1');
    expect(screen.getByTestId('foo')).toBeTruthy();
    expect(screen.getByTestId('bar').textContent).toBe('bar: 2');
  });
  it('should reuse definition with shared state', async function () {
    type ModuleTypeDefinitions = WithWidgetTypeDefinition<
      'main',
      {
        name: string;
        getValues: () => number[];
        addValue: (value: number) => void;
      }
    >;

    const createExtras = () => {
      const valuesRef = { current: [] as number[] };
      return {
        getValues: () => valuesRef.current,
        addValue: (value: number) => {
          valuesRef.current.push(value);
        },
      };
    };

    const r = createInjsxtion<ModuleTypeDefinitions>();
    const mainModuleDefinition = r
      .defineWidget('main')
      .render((outlet, extra) => (
        <div data-testid={extra.name}>
          {extra.name}: {extra.getValues()}
        </div>
      ))
      .extras(createExtras());
    const def1 = mainModuleDefinition
      .with((self) => self.addValue(1))
      .extra('name', 'foo')
      .build();
    const def2 = mainModuleDefinition
      .with((self) => self.addValue(2))
      .extra('name', 'bar')
      .build();

    const mainModule1 = createModule(def1);
    const mainModule2 = createModule(def2);
    await mainModule1.register();
    await mainModule2.register();
    render(
      <>
        {mainModule1.render()}
        {mainModule2.render()}
      </>,
    );
    expect(screen.getByTestId('foo')).toBeTruthy();
    expect(screen.getByTestId('foo').textContent).toBe('foo: 12');
    expect(screen.getByTestId('foo')).toBeTruthy();
    expect(screen.getByTestId('bar').textContent).toBe('bar: 12');
  });
});
