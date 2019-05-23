node("maven") {

  stage ("\u2460 Checkout SCM") {
    checkout([$class: 'GitSCM',
              branches: [[name: '*/master']],
              doGenerateSubmoduleConfigurations: false,
              extensions: [],
              submoduleCfg: [],
              userRemoteConfigs: [[
                url: 'git@git-cicd.gcloud.belgium.be:rest/styleguide.git',
                credentialsId: 'git_technical_user'
              ]]
    ]);
  }

  stage("\u2461 Generate Website") {
    sh "mvn site"
    stash name:"site", includes:"target/site/doc/**"
    sh '''
      APPLICATION_VERSION=$(mvn -Dexec.executable='echo' -Dexec.args='${project.version}' --non-recursive exec:exec -q)
      echo ${APPLICATION_VERSION} > APPLICATION_VERSION
    '''
    env.APPLICATION_VERSION = readFile('APPLICATION_VERSION').trim()
    echo "${APPLICATION_VERSION}"
  }

}

node () {

  stage("\u2462 Build Website Docker Image") {
    checkout([$class: 'GitSCM',
              branches: [[name: '*/build']],
              doGenerateSubmoduleConfigurations: false,
              extensions: [],
              submoduleCfg: [],
              userRemoteConfigs: [[
                url: 'git@git-cicd.gcloud.belgium.be:rest/styleguide.git',
                credentialsId: 'git_technical_user'
              ]]
    ]);
    unstash name:"site"
    sh "cp -rf target/site/doc/* docker/contrib/src"
    sh "oc start-build gcloud-rest-styleguide-website --follow=true --build-loglevel=9 --from-dir='./docker'"
    openshiftVerifyBuild(bldCfg: "gcloud-rest-styleguide-website", waitTime: '240', waitUnit: 'sec', verbose: 'false')
  }

  stage('\u2463 Deploy Website') {
    openshiftDeploy(depCfg: "gcloud-rest-styleguide-website", verbose: 'false', waitTime: '240', waitUnit: 'sec')
    openshiftScale(depCfg: "gcloud-rest-styleguide-website", replicaCount: '1', verbose: 'false', verifyReplicaCount: 'false', waitTime: '240', waitUnit: 'sec')
    openshiftVerifyDeployment(depCfg: "gcloud-rest-styleguide-website", replicaCount: '1', verbose: 'false', verifyReplicaCount: 'true', waitTime: '240', waitUnit: 'sec')
    openshiftVerifyService(svcName: "gcloud-rest-styleguide-website", verbose: 'false')
  }

}

node ('docker') {

  stage('\u2464 Crawling') {
    echo "Running crawler here ..."
    echo "Do some unit test on deployed website here ..."
    // sh '''
    //   set +e
    //   RETURN_CRAWLER=$(docker run -i -e TARGET=http://gcloud-rest-styleguide-website.paas.services.gcloud.belgium.be/rest/index.html container-release.gcloud.belgium.be/crawler:latest)
    //   echo "--"
    //   echo "${RETURN_CRAWLER}"
    //   echo "--"
    //   echo "!!! OK !!!"
    // '''
  }

  stage('\u2465 Undeploy Website') {
    openshiftScale(depCfg: "gcloud-rest-styleguide-website", replicaCount: '0', verbose: 'false', verifyReplicaCount: 'false', waitTime: '240', waitUnit: 'sec')
  }

  stage ('\u2466 Auto Release Tag.') {
    echo "We use an Imagestream for Rest Styleguide deployment in Test environment (Openshift Project : ssb-test-community-tools)"
    withCredentials([string(credentialsId: 'git_technical_user_artifactory_token', variable: 'ARTIFACTORY_TOKEN')]) {
      sh '''
        curl -sSfLo ${WORKSPACE}/getNextDockerGCloudReleaseTag http://git-cicd.gcloud.belgium.be/openshift/scripts/raw/master/artifactory-helper/getNextDockerGCloudReleaseTag.sh
        curl -sSfLo ${WORKSPACE}/promoteDockerImage http://git-cicd.gcloud.belgium.be/openshift/scripts/raw/master/artifactory-helper/promoteDockerImage.sh
        chmod +x ${WORKSPACE}/promoteDockerImage            \
                 ${WORKSPACE}/getNextDockerGCloudReleaseTag

        ARTIFACTORY_USERNAME="gcloud-docker-promoting"

        GCLOUD_DOCKER_TAG=$(${WORKSPACE}/getNextDockerGCloudReleaseTag --artifactory_url="https://repo.gcloud.belgium.be/artifactory" \
                                        --artifactory_username=${ARTIFACTORY_USERNAME} \
                                        --artifactory_token=${ARTIFACTORY_TOKEN} \
                                        --docker_registry="gcloud-docker-release" \
                                        --docker_image="gcloud-rest-styleguide-website" \
                                        --docker_version_in_tag="${APPLICATION_VERSION}" )

        echo ${GCLOUD_DOCKER_TAG} > GCLOUD_DOCKER_TAG

        ${WORKSPACE}/promoteDockerImage --artifactory_url="https://repo.gcloud.belgium.be/artifactory" \
                                        --artifactory_username=${ARTIFACTORY_USERNAME} \
                                        --artifactory_token=${ARTIFACTORY_TOKEN} \
                                        --repoKey="gcloud-docker-release" \
                                        --targetRepo="gcloud-docker-release" \
                                        --dockerRepository="gcloud-rest-styleguide-website" \
                                        --tag="RC" \
                                        --targetTag="${GCLOUD_DOCKER_TAG}" \
                                        --copy="true"

        oc tag --scheduled=true --alias=false container-release.gcloud.belgium.be/gcloud-rest-styleguide-website:${GCLOUD_DOCKER_TAG} gcloud-rest-styleguide:${GCLOUD_DOCKER_TAG}

      '''
    }

    env.GCLOUD_DOCKER_TAG = readFile('GCLOUD_DOCKER_TAG').trim()

  }

  stage ('\u2467 Deployment in Test Env.') {
    echo "Refresh [tst] ImagestreamTag."
    echo "Sleep while Openshift masters refresh all imagestreams ..."
    sh 'sleep 120'
    openshiftTag(srcStream: "gcloud-rest-styleguide", srcTag: "${GCLOUD_DOCKER_TAG}",
                 destStream: "gcloud-rest-styleguide", destTag: "tst",
                 alias: 'true', verbose: 'false')

  }

  stage ('\u2468 Deployment in Production Env.') {
    def userInput = input (id: 'INPUT_APPROVE_ID',
                         message: 'G-Cloud Rest Styleguide Website Pipeline Promotion parameters : ',
                         ok: 'OK',
                         parameters: [booleanParam(name: 'INPUT_APPROVE',
                                                   defaultValue: false,
                                                   description: 'Check this box to promote this image for deployment in Production environment.')],
                         submitter: 'smals-wisa-view,smals-sem-admin,ksz_bcss-o10-view', submitterParameter: 'INPUT_APPROVE_SUBMITTER')

    if ( userInput.INPUT_APPROVE ) {
      echo "The deployment of this image is approved in test.  Refresh [prd] ImagestreamTag."
      echo "Refresh [prd] ImagestreamTag."

      openshiftTag(srcStream: "gcloud-rest-styleguide", srcTag: "${GCLOUD_DOCKER_TAG}",
                   destStream: "gcloud-rest-styleguide", destTag: "prd",
                   alias: 'true', verbose: 'false')

    } else {
     echo "The deployment of this image is not approved in test.  Do not tag this image for Production deployment."
    }
  }

}
