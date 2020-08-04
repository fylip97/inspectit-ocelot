import React from 'react';
import { Tree } from 'primereact/tree';
import { ContextMenu } from 'primereact/contextmenu';
import { connect } from 'react-redux';
import { configurationActions, configurationSelectors } from '../../../redux/ducks/configuration';
import { linkPrefix } from '../../../lib/configuration';

import { DEFAULT_CONFIG_TREE_KEY } from '../../../data/constants';
import { filter, find } from 'lodash';

/**
 * The file tree used in the configuration view.
 */
class FileTree extends React.Component {
  state = {
    contextMenuModel: [],
  };

  contextMenuRef = React.createRef();

  /**
   * Fetch the files initially.
   */
  componentDidMount = () => {
    const { defaultConfig } = this.props;
    this.props.fetchFiles();

    if (Object.entries(defaultConfig).length === 0) {
      this.props.fetchDefaultConfig();
    }
  };

  /**
   * Handle tree selection changes.
   */
  onSelectionChange = (event) => {
    const { selection, selectedDefaultConfigFile } = this.props;
    const newSelection = event.value;
    if (newSelection) {
      if (newSelection !== selection && newSelection !== selectedDefaultConfigFile) {
        this.props.selectFile(newSelection);
      }
    } else {
      if (selection || selectedDefaultConfigFile) {
        this.props.selectFile(null);
      }
    }
  };

  /**
   * Handle ContextMenu selection.
   * Switch between a contextmenu for filenodes and a general menu.
   */
  showContextMenu = (event) => {
    const newSelection = event.value || '';

    if (newSelection && newSelection.startsWith(DEFAULT_CONFIG_TREE_KEY)) {
      // Show no contextmenu when clicked on an ocelot default configuration node.
      event.originalEvent.stopPropagation();
      return;
    }

    this.setState({ contextMenuModel: this.getContextMenuModel(newSelection) });
    this.contextMenuRef.current.show(event.originalEvent || event);
  };

  /**
   * Handle drag and drop movement.
   */
  onDragDrop = (event) => {
    const newTree = event.value.filter((node) => node.key !== DEFAULT_CONFIG_TREE_KEY);
    const paths = this.comparePaths('', newTree);

    if (paths) {
      const { source, target } = paths;
      this.props.move(source, target, true);
    }
  };

  /**
   * Handle delete key press
   */
  onKeyDown = (event) => {
    if (event.key === 'Delete' && this.props.selection) {
      this.props.showDeleteFileDialog(this.props.selection);
    }
  };

  /**
   * Attempt to find a file in the 'wrong' place by comparing a node's key with it's expected key.
   * Returns the old (source) and expected (target) key when a node is found.
   */
  comparePaths = (parentKey, nodes) => {
    const getFileName = (fileNode) => fileNode.key.substring(fileNode.key.lastIndexOf('/') + 1);
    let foundFile = filter(nodes, (file) => file.key !== `${parentKey}/${getFileName(file)}`);
    if (foundFile.length === 1) {
      return {
        source: foundFile[0].key,
        target: `${parentKey}/${getFileName(foundFile[0])}`,
      };
    }

    for (const child of nodes) {
      if (child.children) {
        const res = this.comparePaths(child.key, child.children);
        if (res) {
          return res;
        }
      }
    }

    return null;
  };


  clearAll(files) {

    for (let i = 0; i < files.length; i++) {
      if (files[i].children != null) {
        this.clearAll(files[i].children);
      } else {
        files[i].label = files[i].label.replace('!', '');
      }
    }
    return files;
  }


  compareChanges(files) {

    const commitChanges = this.props.commitChanges;
    if(commitChanges!= null){
      for (let i = 0; i < files.length; i++) {
        if (files[i].children != null) {
          this.compareChanges(files[i].children);
        } else {
          for (let l = 0; l < commitChanges.length; l++) {
            if (files[i].key === commitChanges[l]) {
              files[i].label = files[i].label + " !";
            }
          }
        }
      }
    }
    return files;
  }


  render() {
    const { className, defaultTree, selection, selectedDefaultConfigFile, readOnly } = this.props;
    let files = this.props.files;
    files = this.clearAll(files);
    files = this.compareChanges(files);

    return (
      <div className="this" onContextMenu={readOnly ? undefined : this.showContextMenu} onKeyDown={readOnly ? undefined : this.onKeyDown}>
        <style jsx>{`
                    .this {
                        overflow: auto;
                        flex-grow: 1;
                    }
                    .this :global(.cm-tree-icon) {
                        width: 1.3rem;
                        height: 1.3rem;
                    }
                    .this :global(.cm-tree-label) {
                        color: #aaa;
                    }
                    .this :global(.ocelot-tree-head-orange) {
                        background: url("${linkPrefix}/static/images/inspectit-ocelot-head_orange.svg") center no-repeat;
                        background-size: 1rem 1rem;
                    }
                    .this :global(.ocelot-tree-head-white) {
                        background: url("${linkPrefix}/static/images/inspectit-ocelot-head_white.svg") center no-repeat;
                        background-size: 1rem 1rem;
                    }
				`}</style>
        <ContextMenu model={this.state.contextMenuModel} ref={this.contextMenuRef} />
        <Tree
          className={className}
          filter={true}
          filterBy="label"
          value={defaultTree.concat(files)}
          selectionMode="single"
          selectionKeys={selection || selectedDefaultConfigFile}
          onSelectionChange={this.onSelectionChange}
          onContextMenuSelectionChange={readOnly ? undefined : this.showContextMenu}
          dragdropScope={readOnly ? undefined : 'config-file-tree'}
          onDragDrop={readOnly ? undefined : this.onDragDrop}
        />
      </div>
    );
  }

  getContextMenuModel = (filePath) => {
    const { showCreateDirectoryDialog, showCreateFileDialog, showMoveDialog, showDeleteFileDialog } = this.props;

    return [
      {
        label: 'Add Folder',
        icon: 'pi pi-folder',
        command: () => showCreateDirectoryDialog(filePath),
      },
      {
        label: 'Add File',
        icon: 'pi pi-file',
        command: () => showCreateFileDialog(filePath),
      },
      {
        label: 'Rename',
        icon: 'pi pi-pencil',
        disabled: !filePath,
        command: () => showMoveDialog(filePath),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        disabled: !filePath,
        command: () => showDeleteFileDialog(filePath),
      },
    ];
  };
}

function mapStateToProps(state) {
  const { pendingRequests, selection, defaultConfig, selectedDefaultConfigFile } = state.configuration;
  return {
    files: configurationSelectors.getFileTree(state),
    loading: pendingRequests > 0,
    selection,
    defaultConfig: defaultConfig,
    defaultTree: configurationSelectors.getDefaultConfigTree(state),
    selectedDefaultConfigFile,
  };
}

const mapDispatchToProps = {
  fetchDefaultConfig: configurationActions.fetchDefaultConfig,
  fetchFiles: configurationActions.fetchFiles,
  selectFile: configurationActions.selectFile,
  move: configurationActions.move,
};

export default connect(mapStateToProps, mapDispatchToProps)(FileTree);
