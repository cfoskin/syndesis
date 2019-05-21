import { ALL_STEPS, createStep, DATA_MAPPER } from '@syndesis/api';
import * as H from '@syndesis/history';
import { StepKind } from '@syndesis/models';
import { Breadcrumb } from '@syndesis/ui';
import { WithRouteData } from '@syndesis/utils';
import * as React from 'react';
import { Translation } from 'react-i18next';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { WithClosedNavigation } from '../../shared';
import { WithLeaveConfirmation } from '../../shared/WithLeaveConfirmation';
import { AddStepPage } from './components/editor/AddStepPage';
import { EditorApp } from './components/editor/EditorApp';
import {
  IBaseRouteParams,
  IBaseRouteState,
} from './components/editor/interfaces';
import { SaveIntegrationPage } from './components/editor/SaveIntegrationPage';
import resolvers from './resolvers';
import routes from './routes';

const addStepPage = (
  <AddStepPage
    cancelHref={resolvers.list}
    getAddStepHref={(position, p, s) =>
      resolvers.integration.edit.addStep.selectStep({
        position: `${position}`,
        ...p,
        ...s,
      })
    }
    apiProviderHref={
      resolvers.integration.edit.editStep.apiProvider.selectMethod
    }
    connectionHref={(step, params, state) =>
      resolvers.integration.edit.editStep.connection.configureAction({
        actionId: step.action!.id!,
        connection: step.connection!,
        ...params,
        ...state,
      })
    }
    filterHref={(step, params, state) =>
      resolvers.integration.edit.editStep.basicFilter({
        step,
        ...params,
        ...state,
      })
    }
    getAddMapperStepHref={(position, params, state) =>
      resolvers.integration.edit.addStep.dataMapper({
        position: `${position}`,
        step: {
          ...createStep(),
          ...ALL_STEPS.find(s => s.stepKind === DATA_MAPPER),
        } as StepKind,
        ...params,
        ...state,
      })
    }
    mapperHref={(step, params, state) =>
      resolvers.integration.edit.editStep.dataMapper({
        step,
        ...params,
        ...state,
      })
    }
    templateHref={(step, params, state) =>
      resolvers.integration.edit.editStep.template({
        step,
        ...params,
        ...state,
      })
    }
    stepHref={(step, params, state) =>
      resolvers.integration.edit.editStep.step({
        step,
        ...params,
        ...state,
      })
    }
    saveHref={(p, s) =>
      resolvers.integration.edit.saveAndPublish({
        ...p,
        ...s,
      })
    }
    selfHref={(p, s) =>
      resolvers.integration.edit.index({
        ...p,
        ...s,
      })
    }
  />
);

const saveIntegrationPage = (
  <SaveIntegrationPage
    cancelHref={(p, s) => resolvers.integration.edit.index({ ...p, ...s })}
    postSaveHref={(p, s) =>
      resolvers.integration.edit.index({
        ...p,
        ...s,
      })
    }
    postPublishHref={resolvers.integration.details}
  />
);

/**
 * Entry point for the integration editor app. This is shown when an user clicks
 * on the "Edit" button for any existing integration.
 *
 * Since all the creation routes will show the same breadcrumb and require the
 * left navigation bar to be closed to reclaim space, we do it here.
 *
 * Almost all of the routes *require* some state to be passed for them to
 * properly work, so an url that works for an user *will not work* for another.
 * If you try and open the same url on a different browser, the code will throw
 * an exception because of this.
 *
 * We should set up an error boundary[1] to catch these errors and tell the user
 * that he reached an invalid url, or redirect him to a safe page.
 *
 * [1] https://reactjs.org/docs/error-boundaries.html
 *
 * @todo add an error handler!
 */
export const IntegrationEditorApp: React.FunctionComponent = () => {
  return (
    <Translation ns={['integrations', 'shared']}>
      {t => (
        <WithRouteData<IBaseRouteParams, IBaseRouteState>>
          {({ flowId }, { integration }) => (
            <WithClosedNavigation>
              <Breadcrumb>
                <Link
                  data-testid={'integration-editor-app-integrations'}
                  to={resolvers.list()}
                >
                  {t('shared:Integrations')}
                </Link>
                <Link
                  data-testid={'integration-editor-app-integration'}
                  to={resolvers.integration.details({
                    integrationId: integration.id!,
                  })}
                >
                  {integration.name}
                </Link>
                <span>{t('integrations:editor:addToIntegration')}</span>
              </Breadcrumb>
              <WithLeaveConfirmation
                i18nTitle={t('unsavedChangesTitle')}
                i18nConfirmationMessage={t('unsavedChangesMessage')}
                shouldDisplayDialog={(location: H.LocationDescriptor) => {
                  const url =
                    typeof location === 'string'
                      ? location
                      : location.pathname!;
                  return !url.startsWith(
                    resolvers.integration.edit.root({
                      flowId,
                      integration,
                    }).pathname
                  );
                }}
              >
                {() => (
                  <Switch>
                    <Route
                      path={routes.integration.edit.index}
                      exact={true}
                      children={addStepPage}
                    />

                    {/* add step */}
                    <Route path={routes.integration.edit.addStep.selectStep}>
                      <EditorApp
                        mode={'adding'}
                        appStepRoutes={routes.integration.edit.addStep}
                        appResolvers={resolvers.integration.edit.addStep}
                        cancelHref={(params, state) =>
                          resolvers.integration.edit.index({
                            ...params,
                            ...state,
                          })
                        }
                        postConfigureHref={(updatedIntegration, params) =>
                          resolvers.integration.edit.index({
                            integration: updatedIntegration,
                            ...params,
                          })
                        }
                      />
                    </Route>

                    {/* edit step */}
                    <Route path={routes.integration.edit.editStep.selectStep}>
                      <EditorApp
                        mode={'editing'}
                        appStepRoutes={routes.integration.edit.editStep}
                        appResolvers={resolvers.integration.edit.editStep}
                        cancelHref={(params, state) =>
                          resolvers.integration.edit.index({
                            ...params,
                            ...state,
                          })
                        }
                        postConfigureHref={(updatedIntegration, params) =>
                          resolvers.integration.edit.index({
                            integration: updatedIntegration,
                            ...params,
                          })
                        }
                      />
                    </Route>

                    <Route
                      path={routes.integration.edit.saveAndPublish}
                      exact={true}
                      children={saveIntegrationPage}
                    />
                  </Switch>
                )}
              </WithLeaveConfirmation>
            </WithClosedNavigation>
          )}
        </WithRouteData>
      )}
    </Translation>
  );
};
