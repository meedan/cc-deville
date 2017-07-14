# 
FROM meedan/nodejs
MAINTAINER sysops@meedan.com
ENV IMAGE meedan/cc-deville

ENV DEPLOYUSER=cc \
    DEPLOYDIR=/opt/cc \
    GITREPO=https://github.com/meedan/cc-deville.git

RUN useradd $DEPLOYUSER -s /bin/bash -m

RUN mkdir -p $DEPLOYDIR

# do an initial install to populate vendor_bundle
COPY . $DEPLOYDIR
RUN chown -R ${DEPLOYUSER}:${DEPLOYUSER} ${DEPLOYDIR}

USER $DEPLOYUSER
WORKDIR $DEPLOYDIR
RUN npm install

EXPOSE 8080
CMD ["/opt/cc/start.sh"]