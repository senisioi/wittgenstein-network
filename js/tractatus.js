angular.module('wittgenstein-app', []);

angular.module('wittgenstein-app').controller('WittgensteinController',function($scope, $http, $q){


    $scope.nodesDataset = new vis.DataSet(nodes);
    $scope.edgesDataset = new vis.DataSet(edges);

   
    function loadNetwork() {
          var container = document.getElementById('conceptNetwork');
          var options = {
              nodes: {
                  shape: 'dot',
                  size: 16
              },
              physics: {
                  forceAtlas2Based: {
                      gravitationalConstant: -26,
                      centralGravity: 0.005,
                      springLength: 230,
                      springConstant: 0.18
                  },
                  maxVelocity: 146,
                  solver: 'forceAtlas2Based',
                  timestep: 0.35,
                  stabilization: {
                      iterations: 150
                  }
              }
          };

          var data = {
              nodes: $scope.nodesDataset,
              edges: $scope.edgesDataset
          }
          $scope.network = new vis.Network(container, data, options);
          $scope.network.on("click", neighbourhoodHighlight);
      }

	loadNetwork();
    $scope.$watch('searchTextBox', function() {
    	if ($scope.searchTextBox){
            var options = {
	          shouldSort: true,
	          threshold: 0.6,
	          location: 0,
	          distance: 100,
	          maxPatternLength: 32,
	          keys: ["label"]
	        };
	        var fuse = new Fuse(nodes, options); 
	        var result = fuse.search($scope.searchTextBox);
	        //var val = JSON.stringify(result[0], null, '  ');
	        document.getElementById('resultTextArea').textContent = "Concept: " + result[0].label + "; Group: "+result[0].group;
	        if (result==null || result===false)
	        {
	            var params = {
	                nodes: []
	            }
	        }
	        else
	        {
	            var params = {
	                nodes: [result[0].id]
	            }
	        }
	        neighbourhoodHighlight(params);    
        } 
        else
        {
        	neighbourhoodHighlight({nodes:[]});    
        }
    }, true);

	function neighbourhoodHighlight(params) {
          var allNodes = $scope.nodesDataset.get({
              returnType: "Object"
          });
          if (params.nodes.length > 0) {
              $scope.highlightActive = true;
              var i, j;
              var selectedNode = params.nodes[0];
              var degrees = 2;

              for (var nodeId in allNodes) {
                  allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
                  if (allNodes[nodeId].hiddenLabel === undefined) {
                      allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                      allNodes[nodeId].label = undefined;
                  }
              }
              var connectedNodes = $scope.network.getConnectedNodes(selectedNode);
              var allConnectedNodes = [];

              for (i = 1; i < degrees; i++) {
                  for (j = 0; j < connectedNodes.length; j++) {
                      allConnectedNodes = allConnectedNodes.concat($scope.network.getConnectedNodes(connectedNodes[j]));
                  }
              }

              for (i = 0; i < allConnectedNodes.length; i++) {
                  allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
                  if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
                      allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
                      allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
                  }
              }

              for (i = 0; i < connectedNodes.length; i++) {
                  allNodes[connectedNodes[i]].color = undefined;
                  if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
                      allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
                      allNodes[connectedNodes[i]].hiddenLabel = undefined;
                  }
              }

              allNodes[selectedNode].color = undefined;
              if (allNodes[selectedNode].hiddenLabel !== undefined) {
                  allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
                  allNodes[selectedNode].hiddenLabel = undefined;
              }
          } else if ($scope.highlightActive === true) {
              for (var nodeId in allNodes) {
                  allNodes[nodeId].color = undefined;
                  if (allNodes[nodeId].hiddenLabel !== undefined) {
                      allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                      allNodes[nodeId].hiddenLabel = undefined;
                  }
              }
              $scope.highlightActive = false
          }

          var updateArray = [];
          for (nodeId in allNodes) {
              if (allNodes.hasOwnProperty(nodeId)) {
                  updateArray.push(allNodes[nodeId]);
              }
          }
          $scope.nodesDataset.update(updateArray);
      }


});