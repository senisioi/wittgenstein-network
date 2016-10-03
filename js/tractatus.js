angular.module('wittgenstein-app', ['mobile-angular-ui.gestures','mobile-angular-ui']);

angular.module('wittgenstein-app').controller('WittgensteinController',function($scope, $http, $q){


    $scope.nodesDataset = new vis.DataSet(nodes["english_ogden"]);
    $scope.edgesDataset = new vis.DataSet(edges["english_ogden"]);
    $scope.searchNodes = nodes["english_ogden"];
   
    function loadNetwork() {
          var container = document.getElementById('conceptNetwork');
          var options = {
              autoResize: true,
              layout: {
                  improvedLayout:false
              },
              nodes: {
                  shape: 'dot',
                  size: 16
              },
              physics: {
                  forceAtlas2Based: {
                      gravitationalConstant: -38,
                      centralGravity: 0.005,
                      //springLength: 230,
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

          $scope.network.on("stabilizationProgress", function(params) {
                document.getElementById("loadersmall").style.display = "block";
                document.getElementById("conceptNetwork").style.display = "none";
             });
          $scope.network.once("stabilizationIterationsDone", function() {
            setTimeout(function(){
              document.getElementById("loadersmall").style.display = "none";
              document.getElementById("conceptNetwork").style.display = "block";
            }
            , 5500);

            });

      }

    $scope.$watch('languageSelect', function() {
        if ($scope.languageSelect){
          $scope.nodesDataset = new vis.DataSet(nodes[$scope.languageSelect]);
          $scope.edgesDataset = new vis.DataSet(edges[$scope.languageSelect]);
          $scope.searchNodes = nodes[$scope.languageSelect];
          loadNetwork();
        }
       
    }, true);


    $scope.$watch('searchTextBox', function() {
        if ($scope.searchTextBox){
            var options = {
              shouldSort: true,
              threshold: 0.6,
              location: 0,
              distance: 100,
              maxPatternLength: 32,
              keys: ["title", "label"]
            };
            
            var fuse = new Fuse($scope.searchNodes, options); 
            var result = fuse.search($scope.searchTextBox);
            if (result==null || result===false || result[0] == null || result[0].id == null)
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
                $scope.network.focus(result[0].id);  
            }
            neighbourhoodHighlight(params);  
            
        } 
        else
        {
            neighbourhoodHighlight({nodes:[]});    
        }
    }, true);

    loadNetwork();

    function neighbourhoodHighlight(params) {
          var allNodes = $scope.nodesDataset.get({
              returnType: "Object"
          });
          if (params.nodes.length > 0) {
              $scope.highlightActive = true;
              var i, j;
              var selectedNode = params.nodes[0];
              var degrees = 2;
              document.getElementById('resultTextArea').innerHTML = " Proposition: " + allNodes[selectedNode].title;

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