/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "auditversereferencesearch": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "Run": {
        "path": "/{connectionId}/triggers/manual/run",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "input",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "api-version",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      }
    }
  },
  "azuread": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "CreateOffice365Group": {
        "path": "/{connectionId}/v1.0/groups/office365",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "CreateSecurityGroup": {
        "path": "/{connectionId}/v1.0/groups/securityGroup",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetGroup": {
        "path": "/{connectionId}/v1.0/groups/{id}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetUser": {
        "path": "/{connectionId}/v1.0/users/{id}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UpdateUser": {
        "path": "/{connectionId}/v1.0/users/{id}",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "RefreshTokens": {
        "path": "/{connectionId}/v1.0/users/{id}/revokeSignInSessions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "GetMemberGroupsV2": {
        "path": "/{connectionId}/v2/v1.0/users/{id}/getMemberGroups",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "CreateUser": {
        "path": "/{connectionId}/v1.0/users",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetGroupMembers": {
        "path": "/{connectionId}/v1.0/groups/{id}/members",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "RemoveMemberFromGroup": {
        "path": "/{connectionId}/v1.0/groups/{groupId}/members/{memberId}/$ref",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "memberId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "AddUserToGroup": {
        "path": "/{connectionId}/v1.0/groups/{id}/members/$ref",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "CheckMemberGroupsV2": {
        "path": "/{connectionId}/v2/v1.0/users/{id}/checkMemberGroups",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "AssignManager": {
        "path": "/{connectionId}/v1.0/users/{id}/manager/$ref",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "CreateGroup": {
        "path": "/{connectionId}/v1.0/groups",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetMemberGroups": {
        "path": "/{connectionId}/v1.0/users/{id}/getMemberGroups",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "CheckMemberGroups": {
        "path": "/{connectionId}/v1.0/users/{id}/checkMemberGroups",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      }
    }
  },
  "cp_qlcategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_qlcategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_qlmasterses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_qlmastersid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_qlsubcategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_qlsubcategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_aboutuscategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_aboutuscategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_aboutussubcategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_aboutussubcategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_aboutusleadershipdetailses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_aboutusleadershipdetailsid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_aboutuscontactteamdetailses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_aboutuscontactteamdetailsid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_aboutustextimaegeblockses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_aboutustextimaegeblocksid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_refcategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_refcategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_refitemses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_refitemsid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_refmasterses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_refmastersid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_refsiteses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_refsitesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cp_refsubcategorieses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cp_refsubcategoriesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "ca_about_us_children": {
    "tableId": "",
    "version": "",
    "primaryKey": "ca_about_us_childid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "ca_about_us_child_imagestexts": {
    "tableId": "",
    "version": "",
    "primaryKey": "ca_about_us_child_imagestextid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "ca_about_us_contact_teams": {
    "tableId": "",
    "version": "",
    "primaryKey": "ca_about_us_contact_teamid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "ca_about_us_parents": {
    "tableId": "",
    "version": "",
    "primaryKey": "ca_about_us_parentid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "systemusers": {
    "tableId": "",
    "version": "",
    "primaryKey": "systemuserid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "environmentvariabledefinitions": {
    "tableId": "",
    "version": "",
    "primaryKey": "environmentvariabledefinitionid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "environmentvariablevalues": {
    "tableId": "",
    "version": "",
    "primaryKey": "environmentvariablevalueid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "getsharepointfolders": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "Run": {
        "path": "/{connectionId}/triggers/manual/run",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "input",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "api-version",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      }
    }
  },
  "getsharepointlibraries": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "Run": {
        "path": "/{connectionId}/triggers/manual/run",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "input",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "api-version",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      }
    }
  }
};
