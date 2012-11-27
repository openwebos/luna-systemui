Summary
=======
SystemUI Application for webOS.

Core
-------
This repository contains SystemUI Application for webOS. 

index.html - This is the main html file which creates the main JS object for the App.

app / - App Source Code folder. It contains the following sub-folders

data / - Service Helper functions. 

utils / - Utility functions.

stylesheets/ - This folder contains the CSS stylesheets used by APP UI.

images/ - This folder contains all the UI images.

appinfo.json - App description file. 

depends.js - Required by Enyo 1.0. This file contains the list of all Javascript and CSS files that are used by the App. 

How to Build on Linux
=====================

## Building using OpenEmbedded 

Using the meta-webos layer for OpenEmbedded is the preferred method of building Open webOS components.

This allows your package to be installed into an Open webOS system, or as part of an Open webOS image.

### Building the latest "stable" version

Clone the repository at http://www.github.com/openwebos/build-webos and follow the instructions in that README to build Open webOS.

To build or rebuild a single Open webOS component, if your build-webos directory is ~/openwebos/build-webos, and you are wanting to rebuild the component called "luna-systemui", do:

    $ cd ~/openwebos/build-webos
    $ make cleanall-luna-systemui luna-systemui

The resulting IPK package will be in your BUILD-[target-machine] directory, under deploy/ipk/[architecture], such as this example:

    ~/openwebos/build-webos/BUILD-qemux86/deploy/ipk/qemux86/luna-systemui_2.0.0-1.01-r7_qemux86.ipk

You can transfer this to your existing image, and install it by logging into the Open webOS system, and using:

    $ ipkg install /path/to/luna-systemui_2.0.0-1.01-r7_qemux86.ipk

Or you can create a completely new Open webOS image with:

    $ make webos-image

### Building your local clone

After successfully building the latest stable version, you may configure build-webos to build this component from your own local clone.

You can specify what directory to use as the local source inside the file "global-webos.conf" in your home directory, or within the file "webos-local.conf" within the build-webos directory, by adding the following:

    S_pn-[component-name] = "/path/to/component/source"

such as in this example:

    S_pn-luna-systemui = "/home/user/openwebos/luna-systemui"

Then follow the instructions above to rebuild and install this package.

## Building for Open webOS Desktop

It is often desireable, for rapid iteration and testing purposes, to build a component for use within the Open webOS Desktop system.

### Building the latest "stable" version

Clone the repository at http://www.github.com/openwebos/build-desktop and follow the instructions in the README file.

### Building your local clone

First, follow the directions to build the latest "stable" version.

To build your local clone of a component, such as luna-systemui, instead of the "stable" version installed with the build-webos-desktop script:

* Open the build-webos-desktop.sh script with a text editor
* Locate the function build_component-name (i.e., build_luna-systemui)
* Change the line "cd $BASE/luna-systemui" to use the folder containing your clone, for example "cd ~/openwebos/luna-systemui"
* Close the text editor
* Remove the file ~/luna-desktop-binaries/component-name/luna-desktop-build*.stamp (<tt>~/luna-desktop-binaries/luna-systemui/luna-desktop-build*.stamp</tt>)
* Rebuild by running the build-webos-desktop.sh script again

Cautions:

* When you re-clone openwebos/build-desktop, you'll have to overwrite your changes and reapply them
* Components often advance in parallel with each other, so be prepared to keep your cloned repositories updated
* Fetch and rebase frequently

# Copyright and License Information

All content, including all source code files and documentation files in this repository except otherwise noted are: 

 Copyright (c) 2010-2012 Hewlett-Packard Development Company, L.P.

All content, including all source code files and documentation files in this repository except otherwise noted are:
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this content except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
