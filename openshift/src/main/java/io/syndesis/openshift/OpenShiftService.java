/**
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.syndesis.openshift;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import io.fabric8.openshift.api.model.DeploymentConfig;

public interface OpenShiftService {

    String REVISION_ID_ANNOTATION = "syndesis.io/revision-id";
    String USERNAME_LABEL = "USERNAME";

    /**
     * Creates the deployment (Deployment and Build configurations, Image Streams etc) if
     * not existing and updates a current one if existing. A call to this method is idempotent
     * and called be many times
     *
     * @param name name of the build
     * @param data the deployment data to use
     */
    void setup(String name, DeploymentData data);

    /**
     * Start a previously created build with the data from the given directory
     *
     * @param name name of the build
     * @param tarInputStream input stream representing a tar file containing the project files
     */
    void build(String name, InputStream tarInputStream) throws IOException;

    /**
     * Perform a deployment
     *
     * @param name name of the deployment to trigger
     *
     */
    void deploy(String name);

    boolean isReady(String name);

    /**
     * Deletes the deployment (Deployment and Build configurations, Image Streams etc)
     * @param name of the deployment to delete
     * @return          Returns True if all resources were deleted, False otherwise.
     */
    boolean delete(String name);

    /**
     * Checks if the deployment (Deployment and Build configurations, Image Streams etc) exists
     * @param name of the deployment to delete
     * @return          Returns True if all resources were deleted, False otherwise.
     */
    boolean exists(String name);

    /**
     * Scale the deployment (Deployment and Build configurations, Image Streams etc)
     * @param name of the deployment to delete
     * @param desiredReplicas how many replicas to scale to
     */
    void scale(String name, int desiredReplicas);

    /**
     * Checks if the deployment (Deployment and Build configurations, Image Streams etc) is scaled.
     * @param name of the deployment to delete
     * @param desiredReplicas how many replicas should be running for this method to return true
     */
    boolean isScaled(String name, int desiredReplicas);

    /**
     * Returns the {@link DeploymentConfig}s that match the specified labels.
     * @param labels            The specified labels.
     * @return                  The list of {@link DeploymentConfig}s.
     */
    List<DeploymentConfig> getDeploymentsByLabel(Map<String, String> labels);

    boolean isBuildStarted(String buildName);
}
