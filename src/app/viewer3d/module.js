/**
* @class   AppViewer3d
* @extends GuiPanel
*/
var AppViewer3d = GuiPanel.extend(
{
    /**
    * Setup the module.
    *
    * - Called once by ToysKernel.addModule() after class instanciation.
    *
    * @method setup
    */
    setup: function() {
        // self alias
        var self = this;

        // viewer size
        self.size = {
            width : 800,
            height: self.getLocal('height', 400)
        };

        // create viewer instance
        self.viewer = new Viewer3d({
            size: self.size,
            buildVolume: {
                size: this.getLocal('size')
            }
         });

         // on mesh added to viewer
         self.viewer.onMeshAdded = function(mesh) {
             self.triggerEvent('meshAdded', { mesh: mesh });
         };

         self.viewer.onMeshSelected = function(mesh, selected) {
             self.triggerEvent('meshSelected', {
                 mesh    : mesh,
                 selected: selected
             });
         };

         self.viewer.onMeshRemoved = function(uuid) {
             self.triggerEvent('meshRemoved', {
                 uuid: uuid
             });
         };

        // one view is rendered
        self.model.afterRender = function(elements, model) {
            // set model viewer wrapper element
            model.$viewer = $('#viewer3d');

            // wrap the viewer
            model.$viewer.html(self.viewer.canvas);

            // resize the 3D viewer to fit his wrapper size
            $(window).bind('resize', function() { self.resize(); });
            setTimeout(function() { self.resize(); }, 5);

            // set wrapper verticaly resizable
            model.$viewer.resizable({
                handles: 's',
                resize : function(event, ui) {
                    // update/save new height
                    self.size.height = ui.size.height;
                    self.setLocal('height', self.size.height);

                    // resize to fit parent height
                    self.viewer.resize(self.size.width, self.size.height);
                    self.viewer.render();
                }
            });
        };

        // on expand panel
        self.model.onExpendPanel = function(self, event) {
            // Call parent method
            GuiPanelModel.prototype.onExpendPanel.call(this, self, event);
            // resize to fit parent
            self.module.resize();
        };

        // on view selected
        self.model.controls.onViewSelected = function(name) {
            self.viewer.setView(name);
        };
    },

    /**
    * Resize the 3D viewer to fit his wrapper size.
    *
    * @method resize
    */
    resize: function() {
        // update/save new width
        this.size.width = this.model.$viewer.width();

        // resize the viewer
        this.viewer.resize(this.size.width, this.size.height);
        this.viewer.render();
    },

    /**
    * Called when a panel is moved.
    *
    * @method onPanelMoved
    */
    onPanelMoved: function(module, ui) {
        // if this panel moved, resize viewer to fit his wrapper
        this === module && this.resize();
    },

    /**
    * Called when a mesh is selected.
    *
    * @method onFileLoaded
    */
    onMeshSelected: function(module, data) {
        if (module !== this) {
            this.viewer.setMeshSelected(data.mesh, data.selected);
            this.viewer.render();
        }
    },

    /**
    * Called when all selected meshes must be plisted.
    *
    * @method onFileLoaded
    */
    onSplitSelectedMeshes: function(module, data) {
        this.viewer.splitSelectedMeshes();
        this.viewer.render();
    },

    /**
    * Called when a file is loaded.
    *
    * @method onFileLoaded
    */
    onFileLoaded: function(module, data) {
        //console.log('new file', data.file, data.faces);
        this.viewer.addMesh(data.model.name(), data.faces);
        this.viewer.render();
    },

    /**
    * Called when build volume must be resized.
    *
    * @method onBuildVolumeSizeChange
    */
    onBuildVolumeSizeChange: function(module, size) {
        this.setLocal('size', size);
        this.viewer.resizeBuildVolume(size);
        this.viewer.setView('default');
        this.viewer.render();
    },

    /**
    * Called when an build element bust be toggled...
    *
    * @method onBuildVolumeToggleElement
    */
    onBuildVolumeToggleElement: function(module, name) {
        name = name === 'box' ? 'buildVolume' : name;
        this.viewer.toggleElement(name);
        this.viewer.render();
    }
});
