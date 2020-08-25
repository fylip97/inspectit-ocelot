import React from 'react';
import { connect } from 'react-redux';
import { configurationActions } from '../../../redux/ducks/configuration';

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

/**
 * The toolbar used in the configuration view's file tree.
 */
class FileToolbar extends React.Component {
  fetchFilesWithId = (id) => this.props.fetchFilesWithId(id);
  fetchVersions = () => this.props.fetchVersions();
  selectFile = () => this.props.selectFile();

  fetchFilesAndVersions = () => {
    this.fetchFilesWithId(null);
    this.fetchVersions();
    this.props.versionSelectionChange(0, null);
  }

  render() {
    const { loading, selection, readOnly } = this.props;

    const tooltipOptions = {
      showDelay: 500,
      position: 'top',
    };
    return (
      <div className="this">
        <style jsx>{`
          .this :global(.p-toolbar) {
            border: 0;
            border-radius: 0;
            background-color: #eee;
            border-bottom: 1px solid #ddd;
          }

          .this :global(.p-toolbar-group-left) :global(.p-button) {
            margin-right: 0.25rem;
          }
        `}</style>
        <Toolbar>
          <div className="p-toolbar-group-left">
            <Button
              disabled={readOnly || loading}
              tooltip="New file"
              icon="pi pi-file"
              tooltipOptions={tooltipOptions}
              onClick={() => this.props.showCreateFileDialog(selection)}
            />
            <Button
              disabled={readOnly || loading}
              tooltip="New directory"
              icon="pi pi-folder-open"
              tooltipOptions={tooltipOptions}
              onClick={() => this.props.showCreateDirectoryDialog(selection)}
            />
            <Button
              disabled={readOnly || loading || !selection}
              tooltip="Move/Rename file or directory"
              icon="pi pi-pencil"
              tooltipOptions={tooltipOptions}
              onClick={() => this.props.showMoveDialog(selection)}
            />
            <Button
              disabled={readOnly || loading || !selection}
              tooltip="Delete file or directory"
              icon="pi pi-trash"
              tooltipOptions={tooltipOptions}
              onClick={() => this.props.showDeleteFileDialog(selection)}
            />
          </div>
          <div className="p-toolbar-group-right">
            <Button
              disabled={loading}
              onClick={this.fetchFilesAndVersions}
              tooltip="Reload"
              icon={'pi pi-refresh' + (loading ? ' pi-spin' : '')}
              tooltipOptions={tooltipOptions}
            />
          </div>
        </Toolbar>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { pendingRequests, selection } = state.configuration;
  return {
    loading: pendingRequests > 0,
    selection: selection ? selection : '',
  };
}

const mapDispatchToProps = {
  fetchFilesWithId: configurationActions.fetchFilesWithId,
  fetchVersions: configurationActions.fetchVersions,
  selectFile: configurationActions.selectFile,
};

export default connect(mapStateToProps, mapDispatchToProps)(FileToolbar);
